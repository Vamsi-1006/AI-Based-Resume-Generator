package com.resume.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email String email,
        @Size(max = 150) String subject,
        @NotBlank @Size(min = 10, max = 3000) String message) {
}
