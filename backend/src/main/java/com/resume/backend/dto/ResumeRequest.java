package com.resume.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Field name kept as "userDescription" for backward compatibility with v1 UI. */
public record ResumeRequest(
        @NotBlank(message = "Please describe yourself")
        @Size(min = 30, max = 8000, message = "Description must be between 30 and 8000 characters")
        String userDescription,
        String provider) {
}
