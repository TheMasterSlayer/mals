package com.mals.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsResponse {
    private long totalAssets;
    private long availableAssets;
    private long inUseAssets;
    private long maintenanceAssets;
    private long deployedAssets;
    private long lowStockAlerts;
    private long pendingRequests;
    private long approvedRequests;
    private long totalUsers;
}
