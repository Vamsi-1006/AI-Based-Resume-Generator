package com.resume.backend.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resume.backend.config.LlmProperties;
import com.resume.backend.config.LlmProperties.ProviderConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Consumer;

/**
 * Builds all providers from configuration and routes each call through a
 * fallback chain: preferred provider -> default provider -> fallback-order.
 * Retries transient errors (5xx / timeouts); on 429 it moves to the next provider.
 */
@Component
public class LlmRouter {

    private static final Logger log = LoggerFactory.getLogger(LlmRouter.class);

    private final LlmProperties props;
    private final Map<String, LlmProvider> providers = new LinkedHashMap<>();

    public LlmRouter(LlmProperties props, ObjectMapper mapper) {
        this.props = props;
        HttpClient http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .version(HttpClient.Version.HTTP_1_1)
                .build();
        props.getProviders().forEach((id, cfg) -> providers.put(id, create(id, cfg, http, mapper)));
        log.info("LLM providers loaded: {}", describe());
    }

    /** Factory - the single place to register a new API dialect. */
    private static LlmProvider create(String id, ProviderConfig cfg, HttpClient http, ObjectMapper mapper) {
        return switch (cfg.getType().toLowerCase()) {
            case "anthropic" -> new AnthropicProvider(id, cfg, http, mapper);
            case "openai" -> new OpenAiCompatibleProvider(id, cfg, http, mapper);
            default -> throw new IllegalArgumentException("Unknown LLM provider type '" + cfg.getType() + "' for " + id);
        };
    }

    public LlmResponse chat(LlmRequest request, String preferredProvider) {
        List<LlmProvider> chain = resolveChain(preferredProvider);
        LlmException last = null;

        for (LlmProvider p : chain) {
            for (int attempt = 0; attempt <= props.getMaxRetries(); attempt++) {
                try {
                    LlmResponse r = p.chat(request);
                    log.info("LLM ok provider={} model={} latency={}ms tokens(in/out)={}/{}",
                            r.provider(), r.model(), r.latencyMs(), r.promptTokens(), r.completionTokens());
                    return r;
                } catch (LlmException e) {
                    last = e;
                    log.warn("LLM fail provider={} attempt={} status={} msg={}", p.id(), attempt + 1, e.getStatus(), e.getMessage());
                    if (!e.isRetryable() || e.isRateLimited()) break;   // go to next provider
                    sleep(500L * (attempt + 1));
                }
            }
        }
        throw allFailed(last);
    }

    /**
     * Streaming with fallback: we can switch provider only if the failure
     * happened before the first token was emitted.
     *
     * @return the provider that served the stream
     */
    public LlmProvider stream(LlmRequest request, String preferredProvider, Consumer<LlmProvider> onStart,
                              Consumer<String> onToken) {
        LlmException last = null;
        for (LlmProvider p : resolveChain(preferredProvider)) {
            AtomicBoolean started = new AtomicBoolean(false);
            try {
                onStart.accept(p);
                p.stream(request, token -> {
                    started.set(true);
                    onToken.accept(token);
                });
                return p;
            } catch (LlmException e) {
                last = e;
                log.warn("LLM stream fail provider={} status={} msg={}", p.id(), e.getStatus(), e.getMessage());
                if (started.get()) throw e;
            }
        }
        throw allFailed(last);
    }

    public List<Map<String, Object>> describe() {
        List<Map<String, Object>> out = new ArrayList<>();
        providers.values().forEach(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.id());
            m.put("name", p.displayName());
            m.put("model", p.model());
            m.put("configured", p.isConfigured());
            m.put("default", p.id().equals(props.getDefaultProvider()));
            out.add(m);
        });
        return out;
    }

    List<LlmProvider> resolveChain(String preferred) {
        Set<String> ids = new LinkedHashSet<>();
        if (preferred != null && !preferred.isBlank()) ids.add(preferred.trim());
        ids.add(props.getDefaultProvider());
        props.getFallbackOrder().forEach(s -> ids.add(s.trim()));

        List<LlmProvider> chain = new ArrayList<>();
        for (String id : ids) {
            LlmProvider p = providers.get(id);
            if (p != null && p.isConfigured()) chain.add(p);
        }
        if (chain.isEmpty()) {
            throw new LlmException("No LLM provider is configured. Add e.g. GROQ_API_KEY to backend/.env and restart.",
                    "none", 503, false);
        }
        return chain;
    }

    private static LlmException allFailed(LlmException last) {
        if (last == null) return new LlmException("All LLM providers failed", "none", 502, false);
        int status = last.isRateLimited() ? 429 : 502;
        return new LlmException("All LLM providers failed. Last error: " + last.getMessage(),
                last.getProvider(), status, false, last);
    }

    private static void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}
