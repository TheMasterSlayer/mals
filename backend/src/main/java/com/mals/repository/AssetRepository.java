package com.mals.repository;

import com.mals.entity.Asset;
import com.mals.enums.AssetStatus;
import com.mals.enums.AssetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Map;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    /** Full-text search across name, serialNumber, location, assignedTo. */
    @Query("""
        SELECT a FROM Asset a
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(a.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(a.serialNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(a.location) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(a.assignedTo) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:type IS NULL OR a.type = :type)
          AND (:status IS NULL OR a.status = :status)
          AND (:location IS NULL OR :location = '' OR LOWER(a.location) LIKE LOWER(CONCAT('%', :location, '%')))
        """)
    Page<Asset> search(
        @Param("search")   String search,
        @Param("type")     AssetType type,
        @Param("status")   AssetStatus status,
        @Param("location") String location,
        Pageable pageable
    );

    long countByStatus(AssetStatus status);

    @Query("SELECT COUNT(a) FROM Asset a WHERE a.quantity < 5 AND a.status = 'AVAILABLE'")
    long countLowStock();
}
