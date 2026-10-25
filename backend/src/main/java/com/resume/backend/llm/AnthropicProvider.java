package com.resume.backend.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.resume.backend.config.LlmProperties.ProviderConfig;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Example of a non-OpenAI dialect (Anthropic Messages API) plugged into the same interface.
 */
public class AnthropicProvider implements LlmProvider {

    private static final String API_VERSION = "2023-06-01";

    private final String id;
    private final ProviderConfig cfg;
    private final HttpClient http;
    private final ObjectMapper mapper;

    public AnthropicProvider(String id, ProviderConfig cfg, HttpClient http, ObjectMapper mapper) {
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
            if (resp.statusCode() >= 400) throw LlmException.fromHttp(id, resp.statusCode(), resp.body());

            JsonNode root = mapper.readTree(resp.body());
            StringBuilder text = new StringBuilder();
            for (JsonNode block : root.path("content")) {
                if ("text".equals(block.path("type").asText())) text.append(block.path("text").asText());
            }
            JsonNode usage = root.path("usage");
            return new LlmResponse(text.toString(), id, root.path("model").asText(cfg.getModel()),
                    usage.path("input_tokens").asInt(0), usage.path("output_tokens").asInt(0),
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
                throw LlmException.fromHttp(id, resp.statusCode(), resp.body().collect(Collectors.joining("\n")));
            }
            try (Stream<String> lines = resp.body()) {
                lines.forEach(line -> {
                    if (!line.startsWith("data:")) return;
                    try {
                        JsonNode evt = mapper.readTree(line.substring(5).trim());
                        if ("content_block_delta".equals(evt.path("type").asText())) {
                            String t = evt.path("delta").path("text").asText("");
                            if (!t.isEmpty()) onToken.accept(t);
                        }
                    } catch (IOException ignored) { }
                });
            }
        } catch (IOException e) {
            throw new LlmException("Provider '" + id + "' stream error: " + e.getMessage(), id, 0, true, e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new LlmException("Interrupted", id, 0, false, e);
        }
    }

    private HttpRequest buildRequest(LlmRequest r, boolean stream) throws IOException {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", cfg.getModel());
        body.put("max_tokens", r.maxTokens() != null ? r.maxTokens() : cfg.getMaxTokens());
        body.put("temperature", r.temperature() != null ? r.temperature() : cfg.getTemperature());
        if (stream) body.put("stream", true);
        String system = r.systemPrompt() == null ? "" : r.systemPrompt();
        if (r.jsonMode()) system += "\nRespond with a single valid JSON object only.";
        if (!system.isBlank()) body.put("system", system);
        body.putArray("messages").addObject().put("role", "user").put("content", r.userPrompt());

        String base = cfg.getBaseUrl().replaceAll("/+$", "");
        return HttpRequest.newBuilder(URI.create(base + "/messages"))
                .timeout(Duration.ofSeconds(cfg.getTimeoutSeconds()))
                .header("Content-Type", "application/json")
                .header("x-api-key", cfg.getApiKey())
                .header("anthropic-version", API_VERSION)
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
                .build();
    }
}
