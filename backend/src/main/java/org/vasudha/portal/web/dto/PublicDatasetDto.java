package org.vasudha.portal.web.dto;

import org.vasudha.portal.dataset.DatasetPayload;
import org.vasudha.portal.domain.ChartType;
import org.vasudha.portal.domain.Domain;

import java.util.UUID;

public record PublicDatasetDto(
        UUID id,
        Domain domain,
        ChartType chartType,
        String title,
        long publishedOrder,
        DatasetPayload payload
) {
}
