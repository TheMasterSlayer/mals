// ─────────────────────────────────────────────────────────────────────────────
// MALS – Shared TypeScript Types
// ─────────────────────────────────────────────────────────────────────────────

export type Role = 'ADMIN' | 'COMMANDER' | 'LOGISTICS_OFFICER';

export type AssetType =
  | 'VEHICLE'
  | 'WEAPON'
  | 'EQUIPMENT'
  | 'SUPPLY'
  | 'AIRCRAFT'
  | 'VESSEL'
  | 'COMMUNICATION';

export type AssetStatus =
  | 'AVAILABLE'
  | 'IN_USE'
  | 'MAINTENANCE'
  | 'DEPLOYED'
  | 'DECOMMISSIONED';

export type RequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
  userId: number;
  username: string;
  email: string;
  role: Role;
  rank: string | null;
  unit: string | null;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role?: Role;
  rank?: string;
  unit?: string;
}

// ── Assets ────────────────────────────────────────────────────────────────────

export interface Asset {
  id: number;
  name: string;
  type: AssetType;
  category: string | null;
  serialNumber: string | null;
  quantity: number;
  status: AssetStatus;
  location: string | null;
  assignedTo: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  lastUpdated: string;
}

export interface CreateAssetPayload {
  name: string;
  type: AssetType;
  category?: string;
  serialNumber?: string;
  quantity: number;
  status?: AssetStatus;
  location?: string;
  assignedTo?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

// ── Requests ──────────────────────────────────────────────────────────────────

export interface AssetRequest {
  id: number;
  assetId: number;
  assetName: string;
  assetSerialNumber: string | null;
  requestedById: number;
  requestedByUsername: string;
  quantityRequested: number;
  missionName: string;
  purpose: string | null;
  status: RequestStatus;
  requestedAt: string;
  processedAt: string | null;
  processedByUsername: string | null;
  notes: string | null;
}

export interface CreateMissionPayload {
  assetId: number;
  quantityRequested: number;
  missionName: string;
  purpose?: string;
}

export interface ProcessRequestPayload {
  status: 'APPROVED' | 'REJECTED';
  notes?: string;
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  rank: string | null;
  unit: string | null;
  enabled: boolean;
  createdAt: string;
}

// ── Audit ─────────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: number;
  performedByUsername: string;
  action: string;
  entityType: string | null;
  entityId: number | null;
  details: string | null;
  timestamp: string;
  ipAddress: string | null;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalAssets: number;
  availableAssets: number;
  inUseAssets: number;
  maintenanceAssets: number;
  deployedAssets: number;
  lowStockAlerts: number;
  pendingRequests: number;
  approvedRequests: number;
  totalUsers: number;
}

// ── Generic API pagination ────────────────────────────────────────────────────

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
