package com.mals.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_id")
    private User performedBy;

    /** Human-readable action label, e.g. "ASSET_CREATED", "REQUEST_APPROVED". */
    @Column(nullable = false, length = 60)
    private String action;

    /** JPA entity class simple name, e.g. "Asset", "AssetRequest". */
    @Column(length = 40)
    private String entityType;

    private Long entityId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timestamp;

    @Column(length = 45)
    private String ipAddress;
}
