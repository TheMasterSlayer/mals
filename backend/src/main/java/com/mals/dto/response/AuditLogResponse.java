package com.mals.dto.response;

import com.mals.entity.AuditLog;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuditLogResponse {
    private Long id;
    private String performedByUsername;
    private String action;
    private String entityType;
    private Long entityId;
    private String details;
    private LocalDateTime timestamp;
    private String ipAddress;

    public static AuditLogResponse from(AuditLog l) {
        return AuditLogResponse.builder()
            .id(l.getId())
            .performedByUsername(l.getPerformedBy() != null ? l.getPerformedBy().getUsername() : "SYSTEM")
            .action(l.getAction())
            .entityType(l.getEntityType())
            .entityId(l.getEntityId())
            .details(l.getDetails())
            .timestamp(l.getTimestamp())
            .ipAddress(l.getIpAddress())
            .build();
    }
}
