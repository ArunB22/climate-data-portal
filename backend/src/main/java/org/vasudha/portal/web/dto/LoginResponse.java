package org.vasudha.portal.web.dto;

public record LoginResponse(
        String token,
        String email,
        String role
) {
}
