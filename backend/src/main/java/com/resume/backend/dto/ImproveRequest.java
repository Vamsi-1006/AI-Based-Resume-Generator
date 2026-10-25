package com.resume.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ImproveRequest(
        @NotBlank String section,
        @NotBlank(message = "Nothing to improve - the field is empty")
        @Size(max = 4000) String text,
        String targetRole,
        String provider) {
}
