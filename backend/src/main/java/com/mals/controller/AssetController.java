package com.mals.controller;

import com.mals.dto.request.CreateAssetRequest;
import com.mals.dto.request.UpdateAssetRequest;
import com.mals.dto.response.AssetResponse;
import com.mals.entity.User;
import com.mals.enums.AssetStatus;
import com.mals.enums.AssetType;
import com.mals.service.AssetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    public ResponseEntity<Page<AssetResponse>> search(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) AssetType type,
        @RequestParam(required = false) AssetStatus status,
        @RequestParam(required = false) String location,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(assetService.search(q, type, status, location, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.findById(id));
    }

    @PostMapping
    public ResponseEntity<AssetResponse> create(
        @Valid @RequestBody CreateAssetRequest req,
        @AuthenticationPrincipal User currentUser,
        HttpServletRequest httpRequest
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(assetService.create(req, currentUser, httpRequest.getRemoteAddr()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssetResponse> update(
        @PathVariable Long id,
        @Valid @RequestBody UpdateAssetRequest req,
        @AuthenticationPrincipal User currentUser,
        HttpServletRequest httpRequest
    ) {
        return ResponseEntity.ok(assetService.update(id, req, currentUser, httpRequest.getRemoteAddr()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable Long id,
        @AuthenticationPrincipal User currentUser,
        HttpServletRequest httpRequest
    ) {
        assetService.delete(id, currentUser, httpRequest.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }
}
