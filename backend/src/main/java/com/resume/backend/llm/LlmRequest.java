package com.resume.backend.llm;

/**
 * Provider-neutral chat request.
 *
 * @param temperature null = use provider default
 * @param maxTokens   null = use provider default
 */
public record LlmRequest(String systemPrompt,
                         String userPrompt,
                         boolean jsonMode,
                         Double temperature,
                         Integer maxTokens) {

    public static LlmRequest json(String system, String user) {
        return new LlmRequest(system, user, true, null, null);
    }

    public static LlmRequest text(String system, String user, double temperature) {
        return new LlmRequest(system, user, false, temperature, null);
    }

    public LlmRequest withoutJsonMode() {
        return new LlmRequest(systemPrompt, userPrompt, false, temperature, maxTokens);
    }
}
