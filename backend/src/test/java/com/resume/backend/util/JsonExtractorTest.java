package com.resume.backend.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class JsonExtractorTest {

    @Test
    void extractsFromFencesAndThinkTags() {
        String raw = "<think>maybe {x}</think>Sure!\n```json\n{\"a\":\"b}\",\"c\":{\"d\":1}}\n```";
        assertEquals("{\"a\":\"b}\",\"c\":{\"d\":1}}", JsonExtractor.extractObject(raw));
    }

    @Test
    void returnsNullForTruncatedJson() {
        assertNull(JsonExtractor.extractObject("{\"a\": [1, 2"));
    }

    @Test
    void returnsNullWhenNoJson() {
        assertNull(JsonExtractor.extractObject("no json here"));
    }
}
