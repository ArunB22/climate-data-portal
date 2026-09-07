package org.vasudha.portal.web;

import org.vasudha.portal.dataset.DatasetService;
import org.vasudha.portal.domain.ChartType;
import org.vasudha.portal.domain.Domain;
import org.vasudha.portal.web.dto.SuperAdminDatasetDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/superadmin/datasets")
public class SuperAdminDatasetController {

    private final DatasetService datasetService;

    public SuperAdminDatasetController(DatasetService datasetService) {
        this.datasetService = datasetService;
    }

    @GetMapping
    public List<SuperAdminDatasetDto> list() {
        return datasetService.listAll();
    }

    @PostMapping("/{id}/approve")
    public SuperAdminDatasetDto approve(@PathVariable UUID id) {
        return datasetService.approve(id);
    }

    @PostMapping("/{id}/reject")
    public SuperAdminDatasetDto reject(@PathVariable UUID id) {
        return datasetService.reject(id);
    }

    @PutMapping("/{id}")
    public SuperAdminDatasetDto edit(@PathVariable UUID id,
                                       @RequestParam Domain domain,
                                       @RequestParam ChartType chartType,
                                       @RequestParam String title,
                                       @RequestParam(required = false) MultipartFile file) {
        return datasetService.edit(id, domain, chartType, title, file);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        datasetService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
