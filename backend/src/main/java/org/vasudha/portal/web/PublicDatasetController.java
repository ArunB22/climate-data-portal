package org.vasudha.portal.web;

import org.vasudha.portal.dataset.DatasetService;
import org.vasudha.portal.domain.Domain;
import org.vasudha.portal.web.dto.PublicDatasetDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/datasets")
public class PublicDatasetController {

    private final DatasetService datasetService;

    public PublicDatasetController(DatasetService datasetService) {
        this.datasetService = datasetService;
    }

    @GetMapping
    public List<PublicDatasetDto> landingPage() {
        return datasetService.listPublished();
    }

    @GetMapping("/domain/{domain}")
    public List<PublicDatasetDto> byDomain(@PathVariable Domain domain) {
        return datasetService.listPublishedByDomain(domain);
    }
}
