package com.mals.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateMissionRequest {

    @NotNull(message = "Asset ID is required")
    private Long assetId;

    @NotNull(message = "Quantity requested is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantityRequested;

    @NotBlank(message = "Mission name is required")
    @Size(max = 120)
    private String missionName;

    private String purpose;
}
