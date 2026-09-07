package org.vasudha.portal.web.dto;

import org.vasudha.portal.domain.User;

import java.time.Instant;
import java.util.UUID;

public record AdminAccountDto(UUID id, String email, boolean enabled, Instant createdAt) {
    public static AdminAccountDto from(User u) {
        return new AdminAccountDto(u.getId(), u.getEmail(), u.isEnabled(), u.getCreatedAt());
    }
}
