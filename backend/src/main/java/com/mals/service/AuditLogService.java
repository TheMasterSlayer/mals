package com.mals.service;

import com.mals.dto.response.AuditLogResponse;
import com.mals.entity.AuditLog;
import com.mals.entity.User;
import com.mals.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /** Write an immutable audit entry. Null user = system action. */
    public void log(User performer, String action, String entityType, Long entityId, String details, String ip) {
        auditLogRepository.save(AuditLog.builder()
            .performedBy(performer)
            .action(action)
            .entityType(entityType)
            .entityId(entityId)
            .details(details)
            .ipAddress(ip)
            .build());
    }

    public Page<AuditLogResponse> findFiltered(String action, String entityType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        return auditLogRepository.findFiltered(action, entityType, pageable)
            .map(AuditLogResponse::from);
    }
}
