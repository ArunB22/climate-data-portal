package org.vasudha.portal.dataset;

import java.util.List;
import java.util.Map;

/** Parsed CSV content, generic across chart types: original headers + row data keyed by header. */
public record DatasetPayload(List<String> columns, List<Map<String, Object>> rows) {
}
