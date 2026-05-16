package com.mals.service;

import com.mals.dto.request.CreateAssetRequest;
import com.mals.dto.request.UpdateAssetRequest;
import com.mals.dto.response.AssetResponse;
import com.mals.entity.Asset;
import com.mals.entity.User;
import com.mals.enums.AssetStatus;
import com.mals.enums.AssetType;
import com.mals.exception.ResourceNotFoundException;
import com.mals.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AssetService {

    private final AssetRepository  assetRepository;
    private final AuditLogService  auditLogService;

    public AssetResponse create(CreateAssetRequest req, User actor, String ip) {
        Asset asset = Asset.builder()
            .name(req.getName())
            .type(req.getType())
            .category(req.getCategory())
            .serialNumber(req.getSerialNumber())
            .quantity(req.getQuantity())
            .status(req.getStatus() != null ? req.getStatus() : AssetStatus.AVAILABLE)
            .location(req.getLocation())
            .assignedTo(req.getAssignedTo())
            .description(req.getDescription())
            .latitude(req.getLatitude())
            .longitude(req.getLongitude())
            .build();

        asset = assetRepository.save(asset);
        auditLogService.log(actor, "ASSET_CREATED", "Asset", asset.getId(),
            "Created asset: " + asset.getName(), ip);

        return AssetResponse.from(asset);
    }

    @Transactional(readOnly = true)
    public Page<AssetResponse> search(String q, AssetType type, AssetStatus status,
                                       String location, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("lastUpdated").descending());
        return assetRepository.search(q, type, status, location, pageable).map(AssetResponse::from);
    }

    @Transactional(readOnly = true)
    public AssetResponse findById(Long id) {
        return AssetResponse.from(getOrThrow(id));
    }

    public AssetResponse update(Long id, UpdateAssetRequest req, User actor, String ip) {
        Asset asset = getOrThrow(id);

        if (req.getName()       != null) asset.setName(req.getName());
        if (req.getType()       != null) asset.setType(req.getType());
        if (req.getCategory()   != null) asset.setCategory(req.getCategory());
        if (req.getSerialNumber() != null) asset.setSerialNumber(req.getSerialNumber());
        if (req.getQuantity()   != null) asset.setQuantity(req.getQuantity());
        if (req.getStatus()     != null) asset.setStatus(req.getStatus());
        if (req.getLocation()   != null) asset.setLocation(req.getLocation());
        if (req.getAssignedTo() != null) asset.setAssignedTo(req.getAssignedTo());
        if (req.getDescription() != null) asset.setDescription(req.getDescription());
        if (req.getLatitude()   != null) asset.setLatitude(req.getLatitude());
        if (req.getLongitude()  != null) asset.setLongitude(req.getLongitude());

        asset = assetRepository.save(asset);
        auditLogService.log(actor, "ASSET_UPDATED", "Asset", id,
            "Updated asset: " + asset.getName(), ip);

        return AssetResponse.from(asset);
    }

    public void delete(Long id, User actor, String ip) {
        Asset asset = getOrThrow(id);
        assetRepository.delete(asset);
        auditLogService.log(actor, "ASSET_DELETED", "Asset", id,
            "Deleted asset: " + asset.getName(), ip);
    }

    /** Package-private helper for AssetRequestService to locate entities. */
    Asset getOrThrow(Long id) {
        return assetRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));
    }
}
