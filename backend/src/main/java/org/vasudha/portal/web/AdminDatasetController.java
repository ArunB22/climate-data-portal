package org.vasudha.portal.web;

import org.vasudha.portal.dataset.DatasetService;
import org.vasudha.portal.domain.ChartType;
import org.vasudha.portal.domain.Domain;
import org.vasudha.portal.security.AppUserDetails;
import org.vasudha.portal.web.dto.AdminDatasetDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/datasets")
public class AdminDatasetController {

    private final DatasetService datasetService;

    public AdminDatasetController(DatasetService datasetService) {
        this.datasetService = datasetService;
    }

    @PostMapping
    public ResponseEntity<AdminDatasetDto> create(@AuthenticationPrincipal AppUserDetails principal,
                                                    @RequestParam Domain domain,
                                                    @RequestParam ChartType chartType,
                                                    @RequestParam String title,
                                                    @RequestParam MultipartFile file) {
        AdminDatasetDto created = datasetService.createDataset(principal.getUser(), domain, chartType, title, file);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public List<AdminDatasetDto> myDatasets(@AuthenticationPrincipal AppUserDetails principal) {
        return datasetService.listForAdmin(principal.getId());
    }
}
