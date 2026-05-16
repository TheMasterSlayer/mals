package com.mals.controller;

import com.mals.dto.response.AuditLogResponse;
import com.mals.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<Page<AuditLogResponse>> list(
        @RequestParam(required = false) String action,
        @RequestParam(required = false) String entityType,
        @RequestParam(defaultValue = "0")  int page,
        @RequestParam(defaultValue = "30") int size
    ) {
        return ResponseEntity.ok(auditLogService.findFiltered(action, entityType, page, size));
    }
}
