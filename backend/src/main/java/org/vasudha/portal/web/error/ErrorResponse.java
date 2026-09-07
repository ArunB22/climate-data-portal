package org.vasudha.portal.web.error;

import java.util.List;

public record ErrorResponse(String message, List<String> fieldErrors) {

    public static ErrorResponse of(String message) {
        return new ErrorResponse(message, List.of());
    }
}
