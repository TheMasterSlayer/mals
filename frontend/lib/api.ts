import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type {
  Asset,
  AssetRequest,
  AssetStatus,
  AssetType,
  AuditLog,
  AuthUser,
  CreateAssetPayload,
  CreateMissionPayload,
  DashboardStats,
  LoginPayload,
  Page,
  ProcessRequestPayload,
  RegisterPayload,
  RequestStatus,
  User,
} from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Attach JWT from localStorage on every request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mals_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Redirect to /login on 401
apiClient.interceptors.response.use(
  res => res,
  (err: AxiosError) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('mals_token');
      localStorage.removeItem('mals_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (data: LoginPayload) =>
    apiClient.post<AuthUser>('/auth/login', data).then(r => r.data),

  register: (data: RegisterPayload) =>
    apiClient.post<AuthUser>('/auth/register', data).then(r => r.data),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const dashboardApi = {
  getStats: () =>
    apiClient.get<DashboardStats>('/dashboard/stats').then(r => r.data),
};

// ── Assets ────────────────────────────────────────────────────────────────────

export const assetsApi = {
  search: (params: {
    q?: string;
    type?: AssetType;
    status?: AssetStatus;
    location?: string;
    page?: number;
    size?: number;
  }) => apiClient.get<Page<Asset>>('/assets', { params }).then(r => r.data),

  getById: (id: number) =>
    apiClient.get<Asset>(`/assets/${id}`).then(r => r.data),

  create: (data: CreateAssetPayload) =>
    apiClient.post<Asset>('/assets', data).then(r => r.data),

  update: (id: number, data: Partial<CreateAssetPayload>) =>
    apiClient.put<Asset>(`/assets/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    apiClient.delete(`/assets/${id}`),
};

// ── Requests ──────────────────────────────────────────────────────────────────

export const requestsApi = {
  list: (params: {
    status?: RequestStatus;
    userId?: number;
    page?: number;
    size?: number;
  }) => apiClient.get<Page<AssetRequest>>('/requests', { params }).then(r => r.data),

  getById: (id: number) =>
    apiClient.get<AssetRequest>(`/requests/${id}`).then(r => r.data),

  create: (data: CreateMissionPayload) =>
    apiClient.post<AssetRequest>('/requests', data).then(r => r.data),

  process: (id: number, data: ProcessRequestPayload) =>
    apiClient.put<AssetRequest>(`/requests/${id}/process`, data).then(r => r.data),

  complete: (id: number) =>
    apiClient.put<AssetRequest>(`/requests/${id}/complete`).then(r => r.data),
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const usersApi = {
  list: (params: { page?: number; size?: number }) =>
    apiClient.get<Page<User>>('/users', { params }).then(r => r.data),

  me: () =>
    apiClient.get<User>('/users/me').then(r => r.data),

  getById: (id: number) =>
    apiClient.get<User>(`/users/${id}`).then(r => r.data),

  enable:  (id: number) => apiClient.put(`/users/${id}/enable`),
  disable: (id: number) => apiClient.put(`/users/${id}/disable`),
};

// ── Audit ─────────────────────────────────────────────────────────────────────

export const auditApi = {
  list: (params: { action?: string; entityType?: string; page?: number; size?: number }) =>
    apiClient.get<Page<AuditLog>>('/audit', { params }).then(r => r.data),
};

// ── Error helper ─────────────────────────────────────────────────────────────

export function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { message?: string })?.message;
    return msg ?? err.message ?? 'An unexpected error occurred';
  }
  return String(err);
}
