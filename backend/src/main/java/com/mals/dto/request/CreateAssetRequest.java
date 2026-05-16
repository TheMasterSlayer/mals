package com.mals.dto.request;

import com.mals.enums.AssetStatus;
import com.mals.enums.AssetType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateAssetRequest {

    @NotBlank(message = "Asset name is required")
    @Size(max = 100)
    private String name;

    @NotNull(message = "Asset type is required")
    private AssetType type;

    @Size(max = 60)
    private String category;

    @Size(max = 50)
    private String serialNumber;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private AssetStatus status;

    @Size(max = 100)
    private String location;

    @Size(max = 100)
    private String assignedTo;

    private String description;

    private Double latitude;
    private Double longitude;
}
