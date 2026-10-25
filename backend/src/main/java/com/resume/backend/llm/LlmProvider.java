package com.resume.backend.llm;

import java.util.function.Consumer;

/**
 * Strategy interface - one implementation per API "dialect".
 * Adding a new LLM vendor = implement this (or reuse OpenAiCompatibleProvider).
 */
public interface LlmProvider {

    String id();

    String displayName();

    String model();

    boolean isConfigured();

    LlmResponse chat(LlmRequest request);

    /** Streams text deltas to {@code onToken}; returns when the stream ends. */
    void stream(LlmRequest request, Consumer<String> onToken);
}
