package com.resume.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Map;

/** Used by ATS score, tailoring and interview prep. */
public record JobMatchRequest(
        @NotNull(message = "resume is required") Map<String, Object> resume,
        @NotBlank(message = "Job description is required")
        @Size(min = 50, max = 10000, message = "Job description must be between 50 and 10000 characters")
        String jobDescription,
        String provider) {
}
