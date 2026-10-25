package com.resume.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Map;

public record CoverLetterRequest(
        @NotNull Map<String, Object> resume,
        @NotBlank @Size(min = 50, max = 10000) String jobDescription,
        String companyName,
        String hiringManager,
        String tone,
        String provider) {
}
