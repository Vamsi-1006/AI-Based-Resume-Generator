package com.resume.backend.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.resume.backend.config.LlmProperties.ProviderConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Works with every API that speaks the OpenAI Chat Completions protocol:
 * Groq, xAI Grok, OpenAI, Gemini (OpenAI endpoint), OpenRouter, Ollama, LM Studio, vLLM ...
 */
public class OpenAiCompatibleProvider implements LlmProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenAiCompatibleProvider.class);

    private final String id;
    private final ProviderConfig cfg;
    private final HttpClient http;
    private final ObjectMapper mapper;

    public OpenAiCompatibleProvider(String id, ProviderConfig cfg, HttpClient http, ObjectMapper mapper) {
        this.id = id;
        this.cfg = cfg;
        this.http = http;
        this.mapper = mapper;
    }

    @Override public String id() { return id; }
    @Override public String displayName() { return cfg.getDisplayName() == null ? id : cfg.getDisplayName(); }
    @Override public String model() { return cfg.getModel(); }
    @Override public boolean isConfigured() { return cfg.isConfigured(); }

    @Override
    public LlmResponse chat(LlmRequest request) {
        long start = System.currentTimeMillis();
        try {
            HttpResponse<String> resp = http.send(buildRequest(request, false), HttpResponse.BodyHandlers.ofString());

            // Some models reject response_format - transparently retry once without it.
            if (resp.statusCode() == 400 && useJsonMode(request)
                    && (resp.body().contains("response_format") || resp.body().contains("json_validate_failed"))) {
                log.warn("[{}] JSON mode rejected, retrying without response_format", id);
                return chat(request.withoutJsonMode());
            }
            if (resp.statusCode() >= 400) {
                throw LlmException.fromHttp(id, resp.statusCode(), resp.body());
            }

            JsonNode root = mapper.readTree(resp.body());
            String content = root.path("choices").path(0).path("message").path("content").asText("");
            JsonNode usage = root.path("usage");
            return new LlmResponse(content, id, root.path("model").asText(cfg.getModel()),
                    usage.path("prompt_tokens").asInt(0), usage.path("completion_tokens").asInt(0),
                    System.currentTimeMillis() - start);
        } catch (IOException e) {
            throw new LlmException("Provider '" + id + "' I/O error: " + e.getMessage(), id, 0, true, e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new LlmException("Interrupted", id, 0, false, e);
        }
    }

    @Override
    public void stream(LlmRequest request, Consumer<String> onToken) {
        try {
            HttpResponse<Stream<String>> resp = http.send(buildRequest(request, true), HttpResponse.BodyHandlers.ofLines());
            if (resp.statusCode() >= 400) {
                String body = resp.body().collect(Collectors.joining("\n"));
                throw LlmException.fromHttp(id, resp.statusCode(), body);
            }
            try (Stream<String> lines = resp.body()) {
                lines.forEach(line -> {
                    if (!line.startsWith("data:")) return;
                    String payload = line.substring(5).trim();
                    if (payload.isEmpty() || "[DONE]".equals(payload)) return;
                    try {
                        String delta = mapper.readTree(payload)
                                .path("choices").path(0).path("delta").path("content").asText("");
                        if (!delta.isEmpty()) onToken.accept(delta);
                    } catch (IOException ignored) {
                        // keep-alive or non-JSON line - skip
                    }
                });
            }
        } catch (IOException e) {
            throw new LlmException("Provider '" + id + "' stream error: " + e.getMessage(), id, 0, true, e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new LlmException("Interrupted", id, 0, false, e);
        }
    }

    private boolean useJsonMode(LlmRequest r) {
        return r.jsonMode() && cfg.isJsonMode();
    }

    private HttpRequest buildRequest(LlmRequest r, boolean stream) throws IOException {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", cfg.getModel());
        body.put("temperature", r.temperature() != null ? r.temperature() : cfg.getTemperature());
        body.put("max_tokens", r.maxTokens() != null ? r.maxTokens() : cfg.getMaxTokens());
        if (stream) body.put("stream", true);
        if (useJsonMode(r)) body.putObject("response_format").put("type", "json_object");
        for (Map.Entry<String, Object> e : cfg.getExtraParams().entrySet()) {
            body.set(e.getKey(), mapper.valueToTree(e.getValue()));
        }

        ArrayNode messages = body.putArray("messages");
        if (r.systemPrompt() != null && !r.systemPrompt().isBlank()) {
            messages.addObject().put("role", "system").put("content", r.systemPrompt());
        }
        messages.addObject().put("role", "user").put("content", r.userPrompt());

        String base = cfg.getBaseUrl().replaceAll("/+$", "");
        HttpRequest.Builder b = HttpRequest.newBuilder(URI.create(base + "/chat/completions"))
                .timeout(Duration.ofSeconds(cfg.getTimeoutSeconds()))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)));
        if (cfg.getApiKey() != null && !cfg.getApiKey().isBlank()) {
            b.header("Authorization", "Bearer " + cfg.getApiKey());
        }
        if (stream) b.header("Accept", "text/event-stream");
        return b.build();
    }
}
