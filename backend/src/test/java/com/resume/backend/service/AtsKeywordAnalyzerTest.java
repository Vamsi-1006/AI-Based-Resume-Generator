package com.resume.backend.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AtsKeywordAnalyzerTest {

    @Test
    void findsMatchedAndMissingKeywords() {
        var r = AtsKeywordAnalyzer.analyze(
                "We need a Java developer with Spring Boot, React, AWS, Docker and Kubernetes. CI/CD a plus.",
                "Java Spring Boot React Docker", 15);
        assertTrue(r.matched().contains("spring boot"));
        assertTrue(r.missing().contains("kubernetes"));
        assertFalse(r.matched().contains("we"));
        assertTrue(r.score() > 0 && r.score() < 100);
    }
}
