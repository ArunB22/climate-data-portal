package org.vasudha.portal.dataset;

import tools.jackson.databind.ObjectMapper;
import org.vasudha.portal.domain.ChartType;
import org.vasudha.portal.domain.Dataset;
import org.vasudha.portal.domain.DatasetStatus;
import org.vasudha.portal.domain.Domain;
import org.vasudha.portal.domain.User;
import org.vasudha.portal.repository.DatasetRepository;
import org.vasudha.portal.web.dto.AdminDatasetDto;
import org.vasudha.portal.web.dto.PublicDatasetDto;
import org.vasudha.portal.web.dto.SuperAdminDatasetDto;
import org.vasudha.portal.web.error.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class DatasetService {

    private final DatasetRepository datasetRepository;
    private final CsvDatasetParser csvDatasetParser;
    private final ObjectMapper objectMapper;

    public DatasetService(DatasetRepository datasetRepository, CsvDatasetParser csvDatasetParser, ObjectMapper objectMapper) {
        this.datasetRepository = datasetRepository;
        this.csvDatasetParser = csvDatasetParser;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public AdminDatasetDto createDataset(User admin, Domain domain, ChartType chartType, String title, MultipartFile file) {
        if (title == null || title.isBlank()) {
            throw new ApiException(400, "Chart title is required.");
        }

        DatasetPayload payload = csvDatasetParser.parseAndValidate(file, chartType);
        String payloadJson = writePayload(payload);

        Dataset dataset = new Dataset(admin, domain, chartType, title.trim(), payloadJson);
        dataset = datasetRepository.save(dataset);
        return AdminDatasetDto.from(dataset);
    }

    public List<AdminDatasetDto> listForAdmin(UUID adminId) {
        return datasetRepository.findByAdminIdOrderByCreatedAtDesc(adminId).stream()
                .map(AdminDatasetDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SuperAdminDatasetDto> listAll() {
        return datasetRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(d -> SuperAdminDatasetDto.from(d, readPayload(d.getPayloadJson())))
                .toList();
    }

    @Transactional
    public SuperAdminDatasetDto approve(UUID datasetId) {
        Dataset dataset = getOrThrow(datasetId);
        dataset.setStatus(DatasetStatus.APPROVED);
        dataset.setPublishedOrder(datasetRepository.nextPublishedOrder());
        dataset.setDecidedAt(Instant.now());
        return SuperAdminDatasetDto.from(dataset, readPayload(dataset.getPayloadJson()));
    }

    @Transactional
    public SuperAdminDatasetDto reject(UUID datasetId) {
        Dataset dataset = getOrThrow(datasetId);
        dataset.setStatus(DatasetStatus.REJECTED);
        dataset.setPublishedOrder(null);
        dataset.setDecidedAt(Instant.now());
        return SuperAdminDatasetDto.from(dataset, readPayload(dataset.getPayloadJson()));
    }

    /**
     * Super Admin edit of any Admin's dataset (title/domain/chart type always;
     * the CSV data only if a replacement file is supplied). Editing does not
     * change approval status — the Super Admin is the same authority that
     * would otherwise approve it, so no separate re-approval step is needed.
     */
    @Transactional
    public SuperAdminDatasetDto edit(UUID datasetId, Domain domain, ChartType chartType, String title, MultipartFile file) {
        if (title == null || title.isBlank()) {
            throw new ApiException(400, "Chart title is required.");
        }

        Dataset dataset = getOrThrow(datasetId);
        dataset.setDomain(domain);
        dataset.setChartType(chartType);
        dataset.setTitle(title.trim());

        if (file != null && !file.isEmpty()) {
            DatasetPayload payload = csvDatasetParser.parseAndValidate(file, chartType);
            dataset.setPayloadJson(writePayload(payload));
        }

        return SuperAdminDatasetDto.from(dataset, readPayload(dataset.getPayloadJson()));
    }

    @Transactional
    public void delete(UUID datasetId) {
        if (!datasetRepository.existsById(datasetId)) {
            throw new ApiException(404, "Dataset not found.");
        }
        datasetRepository.deleteById(datasetId);
    }

    public List<PublicDatasetDto> listPublished() {
        return datasetRepository.findByStatusOrderByPublishedOrderAsc(DatasetStatus.APPROVED).stream()
                .map(this::toPublicDto)
                .toList();
    }

    public List<PublicDatasetDto> listPublishedByDomain(Domain domain) {
        return datasetRepository.findByStatusAndDomainOrderByPublishedOrderAsc(DatasetStatus.APPROVED, domain).stream()
                .map(this::toPublicDto)
                .toList();
    }

    private Dataset getOrThrow(UUID id) {
        return datasetRepository.findById(id)
                .orElseThrow(() -> new ApiException(404, "Dataset not found."));
    }

    private PublicDatasetDto toPublicDto(Dataset dataset) {
        return new PublicDatasetDto(dataset.getId(), dataset.getDomain(), dataset.getChartType(),
                dataset.getTitle(), dataset.getPublishedOrder(), readPayload(dataset.getPayloadJson()));
    }

    private String writePayload(DatasetPayload payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (Exception ex) {
            throw new ApiException(500, "Could not store the dataset.");
        }
    }

    private DatasetPayload readPayload(String json) {
        try {
            return objectMapper.readValue(json, DatasetPayload.class);
        } catch (Exception ex) {
            throw new ApiException(500, "Stored dataset is corrupted.");
        }
    }
}
