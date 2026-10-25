package com.resume.backend.service;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ResumeNormalizerTest {

    @Test
    @SuppressWarnings("unchecked")
    void fixesLooseModelOutput() {
        Map<String, Object> raw = Map.of(
                "personalInformation", Map.of("name", "Asha", "linkedin", "https://linkedin.com/in/asha"),
                "skills", List.of("Java", "React"),
                "projects", List.of(Map.of("title", "X", "technologies", List.of("Java", "Spring"))));

        Map<String, Object> out = ResumeNormalizer.normalize(raw);

        Map<String, Object> pi = (Map<String, Object>) out.get("personalInformation");
        assertEquals("Asha", pi.get("fullName"));
        assertEquals("https://linkedin.com/in/asha", pi.get("linkedIn"));
        List<Map<String, Object>> skills = (List<Map<String, Object>>) out.get("skills");
        assertEquals("Java", skills.get(0).get("title"));
        List<Map<String, Object>> projects = (List<Map<String, Object>>) out.get("projects");
        assertEquals("Java, Spring", projects.get(0).get("technologiesUsed"));
        assertTrue(((List<?>) out.get("education")).isEmpty());
    }
}
