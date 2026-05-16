package com.mals.dto.response;

import com.mals.entity.Asset;
import com.mals.enums.AssetStatus;
import com.mals.enums.AssetType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AssetResponse {
    private Long id;
    private String name;
    private AssetType type;
    private String category;
    private String serialNumber;
    private Integer quantity;
    private AssetStatus status;
    private String location;
    private String assignedTo;
    private String description;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;

    public static AssetResponse from(Asset a) {
        return AssetResponse.builder()
            .id(a.getId())
            .name(a.getName())
            .type(a.getType())
            .category(a.getCategory())
            .serialNumber(a.getSerialNumber())
            .quantity(a.getQuantity())
            .status(a.getStatus())
            .location(a.getLocation())
            .assignedTo(a.getAssignedTo())
            .description(a.getDescription())
            .latitude(a.getLatitude())
            .longitude(a.getLongitude())
            .createdAt(a.getCreatedAt())
            .lastUpdated(a.getLastUpdated())
            .build();
    }
}
