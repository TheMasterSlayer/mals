package com.mals.repository;

import com.mals.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("""
        SELECT l FROM AuditLog l
        WHERE (:action IS NULL OR :action = '' OR LOWER(l.action) LIKE LOWER(CONCAT('%', :action, '%')))
          AND (:entityType IS NULL OR :entityType = '' OR l.entityType = :entityType)
        ORDER BY l.timestamp DESC
        """)
    Page<AuditLog> findFiltered(
        @Param("action")     String action,
        @Param("entityType") String entityType,
        Pageable pageable
    );
}
