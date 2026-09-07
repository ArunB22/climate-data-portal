package org.vasudha.portal.web.dto;

import org.vasudha.portal.domain.ChartType;
import org.vasudha.portal.domain.Dataset;
import org.vasudha.portal.domain.DatasetStatus;
import org.vasudha.portal.domain.Domain;

import java.time.Instant;
import java.util.UUID;

public record AdminDatasetDto(
        UUID id,
        Domain domain,
        ChartType chartType,
        String title,
        DatasetStatus status,
        Instant createdAt
) {
    public static AdminDatasetDto from(Dataset d) {
        return new AdminDatasetDto(d.getId(), d.getDomain(), d.getChartType(), d.getTitle(), d.getStatus(), d.getCreatedAt());
    }
}
