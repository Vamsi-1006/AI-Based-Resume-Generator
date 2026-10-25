package com.resume.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Binds the "llm:" block of application.yml. */
@ConfigurationProperties(prefix = "llm")
public class LlmProperties {

    private String defaultProvider = "groq";
    private List<String> fallbackOrder = new ArrayList<>();
    private int maxRetries = 1;
    private Map<String, ProviderConfig> providers = new LinkedHashMap<>();

    public static class ProviderConfig {
        /** "openai" (any OpenAI-compatible API) or "anthropic". */
        private String type = "openai";
        private String displayName;
        private boolean enabled = true;
        private boolean requiresApiKey = true;
        private String baseUrl;
        private String apiKey;
        private String model;
        private double temperature = 0.3;
        private int maxTokens = 4096;
        /** Send response_format={"type":"json_object"} for JSON tasks. */
        private boolean jsonMode = false;
        private int timeoutSeconds = 90;
        /** Provider-specific body params, e.g. reasoning_effort for gpt-oss. */
        private Map<String, Object> extraParams = new HashMap<>();

        public boolean isConfigured() {
            return enabled && baseUrl != null && !baseUrl.isBlank()
                    && model != null && !model.isBlank()
                    && (!requiresApiKey || (apiKey != null && !apiKey.isBlank()));
        }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public boolean isRequiresApiKey() { return requiresApiKey; }
        public void setRequiresApiKey(boolean requiresApiKey) { this.requiresApiKey = requiresApiKey; }
        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }
        public double getTemperature() { return temperature; }
        public void setTemperature(double temperature) { this.temperature = temperature; }
        public int getMaxTokens() { return maxTokens; }
        public void setMaxTokens(int maxTokens) { this.maxTokens = maxTokens; }
        public boolean isJsonMode() { return jsonMode; }
        public void setJsonMode(boolean jsonMode) { this.jsonMode = jsonMode; }
        public int getTimeoutSeconds() { return timeoutSeconds; }
        public void setTimeoutSeconds(int timeoutSeconds) { this.timeoutSeconds = timeoutSeconds; }
        public Map<String, Object> getExtraParams() { return extraParams; }
        public void setExtraParams(Map<String, Object> extraParams) { this.extraParams = extraParams; }
    }

    public String getDefaultProvider() { return defaultProvider; }
    public void setDefaultProvider(String defaultProvider) { this.defaultProvider = defaultProvider; }
    public List<String> getFallbackOrder() { return fallbackOrder; }
    public void setFallbackOrder(List<String> fallbackOrder) { this.fallbackOrder = fallbackOrder; }
    public int getMaxRetries() { return maxRetries; }
    public void setMaxRetries(int maxRetries) { this.maxRetries = maxRetries; }
    public Map<String, ProviderConfig> getProviders() { return providers; }
    public void setProviders(Map<String, ProviderConfig> providers) { this.providers = providers; }
}
