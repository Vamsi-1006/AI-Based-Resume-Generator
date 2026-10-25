package com.resume.backend.dto;

import java.util.Map;

/** Standard envelope: { data: {...}, meta: { provider, model, latencyMs, tokens, cached } } */
public record AiResult(Map<String, Object> data, Map<String, Object> meta) {
}
