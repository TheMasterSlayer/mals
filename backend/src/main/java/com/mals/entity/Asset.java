package com.mals.entity;

import com.mals.enums.AssetStatus;
import com.mals.enums.AssetType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AssetType type;

    @Column(length = 60)
    private String category;

    @Column(unique = true, length = 50)
    private String serialNumber;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private AssetStatus status = AssetStatus.AVAILABLE;

    /** Base / installation name where the asset is physically located. */
    @Column(length = 100)
    private String location;

    /** Free-text field for unit or personnel assigned to this asset. */
    @Column(length = 100)
    private String assignedTo;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Geographic coordinates for map view. */
    private Double latitude;
    private Double longitude;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime lastUpdated;
}
