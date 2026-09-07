package org.vasudha.portal.dataset;

import java.util.List;

public class CsvValidationException extends RuntimeException {

    private final List<String> errors;

    public CsvValidationException(List<String> errors) {
        super("CSV validation failed");
        this.errors = errors;
    }

    public List<String> getErrors() {
        return errors;
    }
}
