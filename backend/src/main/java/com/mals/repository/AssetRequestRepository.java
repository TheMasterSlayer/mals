package com.mals.repository;

import com.mals.entity.AssetRequest;
import com.mals.entity.User;
import com.mals.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetRequestRepository extends JpaRepository<AssetRequest, Long> {

    Page<AssetRequest> findByRequestedBy(User user, Pageable pageable);

    Page<AssetRequest> findByStatus(RequestStatus status, Pageable pageable);

    @Query(
        value = """
            SELECT r FROM AssetRequest r
            LEFT JOIN FETCH r.requestedBy
            LEFT JOIN FETCH r.asset
            LEFT JOIN FETCH r.processedBy
            WHERE (:status IS NULL OR r.status = :status)
              AND (:userId IS NULL OR r.requestedBy.id = :userId)
            """,
        countQuery = """
            SELECT COUNT(r) FROM AssetRequest r
            WHERE (:status IS NULL OR r.status = :status)
              AND (:userId IS NULL OR r.requestedBy.id = :userId)
            """
    )
    Page<AssetRequest> findFiltered(
        @Param("status") RequestStatus status,
        @Param("userId") Long userId,
        Pageable pageable
    );

    long countByStatus(RequestStatus status);
}
