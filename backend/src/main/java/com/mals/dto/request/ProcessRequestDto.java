package com.mals.dto.request;

import com.mals.enums.RequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProcessRequestDto {

    @NotNull(message = "Status is required")
    private RequestStatus status;

    private String notes;
}
