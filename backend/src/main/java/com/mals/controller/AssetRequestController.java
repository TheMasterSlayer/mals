package com.mals.controller;

import com.mals.dto.request.CreateMissionRequest;
import com.mals.dto.request.ProcessRequestDto;
import com.mals.dto.response.AssetRequestResponse;
import com.mals.entity.User;
import com.mals.enums.RequestStatus;
import com.mals.service.AssetRequestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class AssetRequestController {

    private final AssetRequestService requestService;

    @GetMapping
    public ResponseEntity<Page<AssetRequestResponse>> list(
        @RequestParam(required = false) RequestStatus status,
        @RequestParam(required = false) Long userId,
        @RequestParam(defaultValue = "0")  int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(requestService.findFiltered(status, userId, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetRequestResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.findById(id));
    }

    @PostMapping
    public ResponseEntity<AssetRequestResponse> create(
        @Valid @RequestBody CreateMissionRequest req,
        @AuthenticationPrincipal User currentUser,
        HttpServletRequest httpRequest
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(requestService.create(req, currentUser, httpRequest.getRemoteAddr()));
    }

    /** COMMANDER / ADMIN: approve or reject. */
    @PutMapping("/{id}/process")
    public ResponseEntity<AssetRequestResponse> process(
        @PathVariable Long id,
        @Valid @RequestBody ProcessRequestDto dto,
        @AuthenticationPrincipal User currentUser,
        HttpServletRequest httpRequest
    ) {
        return ResponseEntity.ok(requestService.process(id, dto, currentUser, httpRequest.getRemoteAddr()));
    }

    /** Mark approved request as completed (assets returned). */
    @PutMapping("/{id}/complete")
    public ResponseEntity<AssetRequestResponse> complete(
        @PathVariable Long id,
        @AuthenticationPrincipal User currentUser,
        HttpServletRequest httpRequest
    ) {
        return ResponseEntity.ok(requestService.complete(id, currentUser, httpRequest.getRemoteAddr()));
    }

    /** Cancel a pending request (requester or ADMIN only). */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<AssetRequestResponse> cancel(
        @PathVariable Long id,
        @AuthenticationPrincipal User currentUser,
        HttpServletRequest httpRequest
    ) {
        return ResponseEntity.ok(requestService.cancel(id, currentUser, httpRequest.getRemoteAddr()));
    }
}
