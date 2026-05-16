package com.mals.service;

import com.mals.dto.request.CreateMissionRequest;
import com.mals.dto.request.ProcessRequestDto;
import com.mals.dto.response.AssetRequestResponse;
import com.mals.entity.Asset;
import com.mals.entity.AssetRequest;
import com.mals.entity.User;
import com.mals.enums.AssetStatus;
import com.mals.enums.RequestStatus;
import com.mals.enums.Role;
import com.mals.exception.ResourceNotFoundException;
import com.mals.repository.AssetRepository;
import com.mals.repository.AssetRequestRepository;
import org.springframework.security.access.AccessDeniedException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class AssetRequestService {

    private final AssetRequestRepository requestRepository;
    private final AssetRepository        assetRepository;
    private final AuditLogService        auditLogService;

    public AssetRequestResponse create(CreateMissionRequest req, User requester, String ip) {
        Asset asset = assetRepository.findById(req.getAssetId())
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + req.getAssetId()));

        if (asset.getStatus() == AssetStatus.DECOMMISSIONED) {
            throw new IllegalStateException("Asset is decommissioned and cannot be requested");
        }
        if (asset.getQuantity() < req.getQuantityRequested()) {
            throw new IllegalStateException(
                "Requested quantity (" + req.getQuantityRequested() +
                ") exceeds available (" + asset.getQuantity() + ")");
        }

        AssetRequest request = AssetRequest.builder()
            .requestedBy(requester)
            .asset(asset)
            .quantityRequested(req.getQuantityRequested())
            .missionName(req.getMissionName())
            .purpose(req.getPurpose())
            .status(RequestStatus.PENDING)
            .build();

        request = requestRepository.save(request);
        auditLogService.log(requester, "REQUEST_SUBMITTED", "AssetRequest", request.getId(),
            "Mission request for " + asset.getName() + " (qty: " + req.getQuantityRequested() + ")", ip);

        return AssetRequestResponse.from(request);
    }

    @Transactional(readOnly = true)
    public Page<AssetRequestResponse> findFiltered(RequestStatus status, Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestedAt").descending());
        return requestRepository.findFiltered(status, userId, pageable).map(AssetRequestResponse::from);
    }

    @Transactional(readOnly = true)
    public AssetRequestResponse findById(Long id) {
        return AssetRequestResponse.from(getOrThrow(id));
    }

    /** Approve or reject a request. Only COMMANDER / ADMIN may call this. */
    public AssetRequestResponse process(Long id, ProcessRequestDto dto, User processor, String ip) {
        AssetRequest request = getOrThrow(id);

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Request is already " + request.getStatus());
        }

        request.setStatus(dto.getStatus());
        request.setProcessedAt(LocalDateTime.now());
        request.setProcessedBy(processor);
        request.setNotes(dto.getNotes());

        // On approval — deduct inventory and mark asset status
        if (dto.getStatus() == RequestStatus.APPROVED) {
            Asset asset = request.getAsset();
            int newQty = asset.getQuantity() - request.getQuantityRequested();
            asset.setQuantity(newQty);
            asset.setStatus(newQty == 0 ? AssetStatus.IN_USE : AssetStatus.AVAILABLE);
            assetRepository.save(asset);
        }

        request = requestRepository.save(request);
        auditLogService.log(processor, "REQUEST_" + dto.getStatus().name(), "AssetRequest", id,
            "Request " + dto.getStatus().name().toLowerCase() + " by " + processor.getUsername(), ip);

        return AssetRequestResponse.from(request);
    }

    /** Mark an approved request as completed (asset returned). */
    public AssetRequestResponse complete(Long id, User actor, String ip) {
        AssetRequest request = getOrThrow(id);
        if (request.getStatus() != RequestStatus.APPROVED) {
            throw new IllegalStateException("Only approved requests can be completed");
        }

        // Return quantity to asset pool
        Asset asset = request.getAsset();
        asset.setQuantity(asset.getQuantity() + request.getQuantityRequested());
        asset.setStatus(AssetStatus.AVAILABLE);
        assetRepository.save(asset);

        request.setStatus(RequestStatus.COMPLETED);
        request.setProcessedAt(LocalDateTime.now());
        request = requestRepository.save(request);

        auditLogService.log(actor, "REQUEST_COMPLETED", "AssetRequest", id,
            "Assets returned: " + asset.getName(), ip);

        return AssetRequestResponse.from(request);
    }

    /** Cancel a pending request. Requester can cancel their own; ADMIN can cancel any. */
    public AssetRequestResponse cancel(Long id, User actor, String ip) {
        AssetRequest request = getOrThrow(id);

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Only pending requests can be cancelled");
        }
        if (!request.getRequestedBy().getId().equals(actor.getId()) && actor.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("You can only cancel your own requests");
        }

        request.setStatus(RequestStatus.CANCELLED);
        request.setProcessedAt(LocalDateTime.now());
        request.setProcessedBy(actor);
        request = requestRepository.save(request);

        auditLogService.log(actor, "REQUEST_CANCELLED", "AssetRequest", id,
            "Request cancelled by " + actor.getUsername(), ip);

        return AssetRequestResponse.from(request);
    }

    private AssetRequest getOrThrow(Long id) {
        return requestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Request not found with id: " + id));
    }
}
