package org.vasudha.portal.repository;

import org.vasudha.portal.domain.Dataset;
import org.vasudha.portal.domain.DatasetStatus;
import org.vasudha.portal.domain.Domain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface DatasetRepository extends JpaRepository<Dataset, UUID> {

    List<Dataset> findByAdminIdOrderByCreatedAtDesc(UUID adminId);

    List<Dataset> findAllByOrderByCreatedAtDesc();

    List<Dataset> findByStatusOrderByPublishedOrderAsc(DatasetStatus status);

    List<Dataset> findByStatusAndDomainOrderByPublishedOrderAsc(DatasetStatus status, Domain domain);

    @Query(value = "select nextval('dataset_published_order_seq')", nativeQuery = true)
    long nextPublishedOrder();
}
