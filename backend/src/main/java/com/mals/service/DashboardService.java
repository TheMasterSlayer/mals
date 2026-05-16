package com.mals.service;

import com.mals.dto.response.DashboardStatsResponse;
import com.mals.enums.AssetStatus;
import com.mals.enums.RequestStatus;
import com.mals.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final AssetRepository        assetRepository;
    private final AssetRequestRepository requestRepository;
    private final UserRepository         userRepository;

    public DashboardStatsResponse getStats() {
        return DashboardStatsResponse.builder()
            .totalAssets(assetRepository.count())
            .availableAssets(assetRepository.countByStatus(AssetStatus.AVAILABLE))
            .inUseAssets(assetRepository.countByStatus(AssetStatus.IN_USE))
            .maintenanceAssets(assetRepository.countByStatus(AssetStatus.MAINTENANCE))
            .deployedAssets(assetRepository.countByStatus(AssetStatus.DEPLOYED))
            .lowStockAlerts(assetRepository.countLowStock())
            .pendingRequests(requestRepository.countByStatus(RequestStatus.PENDING))
            .approvedRequests(requestRepository.countByStatus(RequestStatus.APPROVED))
            .totalUsers(userRepository.count())
            .build();
    }
}
