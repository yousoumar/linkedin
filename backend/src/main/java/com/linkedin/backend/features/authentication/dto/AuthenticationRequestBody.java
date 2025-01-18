package com.linkedin.backend.features.authentication.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthenticationRequestBody(
        @NotBlank(message = "Email is mandatory") String email,
        @NotBlank(message = "Password is mandatory") String password
) {
}