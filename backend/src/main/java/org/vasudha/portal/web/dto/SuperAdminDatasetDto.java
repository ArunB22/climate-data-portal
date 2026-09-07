package org.vasudha.portal.web.dto;

import org.vasudha.portal.dataset.DatasetPayload;
import org.vasudha.portal.domain.ChartType;
import org.vasudha.portal.domain.Dataset;
import org.vasudha.portal.domain.DatasetStatus;
import org.vasudha.portal.domain.Domain;

import java.time.Instant;
import java.util.UUID;

public record SuperAdminDatasetDto(
        UUID id,
        Domain domain,
        ChartType chartType,
        String title,
        DatasetStatus status,
        String submittedByEmail,
        Instant createdAt,
        Instant decidedAt,
        DatasetPayload payload
) {
    public static SuperAdminDatasetDto from(Dataset d, DatasetPayload payload) {
        return new SuperAdminDatasetDto(d.getId(), d.getDomain(), d.getChartType(), d.getTitle(), d.getStatus(),
                d.getAdmin().getEmail(), d.getCreatedAt(), d.getDecidedAt(), payload);
    }
}
