package com.mals.dto.response;

import com.mals.entity.AssetRequest;
import com.mals.enums.RequestStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AssetRequestResponse {
    private Long id;
    private Long assetId;
    private String assetName;
    private String assetSerialNumber;
    private Long requestedById;
    private String requestedByUsername;
    private Integer quantityRequested;
    private String missionName;
    private String purpose;
    private RequestStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
    private String processedByUsername;
    private String notes;

    public static AssetRequestResponse from(AssetRequest r) {
        return AssetRequestResponse.builder()
            .id(r.getId())
            .assetId(r.getAsset().getId())
            .assetName(r.getAsset().getName())
            .assetSerialNumber(r.getAsset().getSerialNumber())
            .requestedById(r.getRequestedBy().getId())
            .requestedByUsername(r.getRequestedBy().getUsername())
            .quantityRequested(r.getQuantityRequested())
            .missionName(r.getMissionName())
            .purpose(r.getPurpose())
            .status(r.getStatus())
            .requestedAt(r.getRequestedAt())
            .processedAt(r.getProcessedAt())
            .processedByUsername(r.getProcessedBy() != null ? r.getProcessedBy().getUsername() : null)
            .notes(r.getNotes())
            .build();
    }
}
