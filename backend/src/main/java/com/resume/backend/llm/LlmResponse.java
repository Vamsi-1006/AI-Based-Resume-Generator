package com.resume.backend.llm;

public record LlmResponse(String content,
                          String provider,
                          String model,
                          int promptTokens,
                          int completionTokens,
                          long latencyMs) {
}
