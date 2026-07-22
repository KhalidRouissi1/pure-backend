import api, { ApiEnvelope, unwrapData, unwrapItems } from './api';
import { Store, User } from '../types';

export interface AdminDashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalStores: number;
  verifiedStores: number;
  pendingStores: number;
  totalProducts: number;
  totalOrders: number;
  totalOrdersPending: number;
  totalOrdersConfirmed: number;
  totalOrdersDelivered: number;
  totalOrdersCancelled: number;
  totalGmv: number;
  pendingReviews: number;
  pendingCertifications: number;
  newUsers7d: number;
  newStores7d: number;
  newProducts7d: number;
  newOrders7d: number;
  trustedBadgeCount: number;
  avgProductsPerStore: number;
}

interface AdminListResponse<T> {
  items: T[];
  pagination?: unknown;
}

const defaultStats: AdminDashboardStats = {
  totalUsers: 0,
  totalSellers: 0,
  totalStores: 0,
  verifiedStores: 0,
  pendingStores: 0,
  totalProducts: 0,
  totalOrders: 0,
  totalOrdersPending: 0,
  totalOrdersConfirmed: 0,
  totalOrdersDelivered: 0,
  totalOrdersCancelled: 0,
  totalGmv: 0,
  pendingReviews: 0,
  pendingCertifications: 0,
  newUsers7d: 0,
  newStores7d: 0,
  newProducts7d: 0,
  newOrders7d: 0,
  trustedBadgeCount: 0,
  avgProductsPerStore: 0,
};

export const getPendingStores = async () => {
  try {
    const response = await api.get<ApiEnvelope<Store[]>>('/admin/pending-stores');
    return unwrapItems<Store>(response);
  } catch {
    return [];
  }
};

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  try {
    const response = await api.get<ApiEnvelope<{ stats?: AdminDashboardStats }>>('/admin/dashboard');
    return unwrapData(response, { stats: defaultStats }).stats ?? defaultStats;
  } catch {
    return defaultStats;
  }
};

export const getAdminDashboardFull = async () => {
  try {
    const response = await api.get<ApiEnvelope<Record<string, unknown>>>('/admin/dashboard');
    return unwrapData(response, {});
  } catch {
    return {};
  }
};

export const getRecentStores = async (limit: number = 10) => {
  try {
    const response = await api.get<ApiEnvelope<unknown[]>>(`/admin/stores/recent?limit=${limit}`);
    return unwrapItems(response);
  } catch {
    return [];
  }
};

export const getRecentProducts = async (limit: number = 10) => {
  try {
    const response = await api.get<ApiEnvelope<unknown[]>>(`/admin/products/recent?limit=${limit}`);
    return unwrapItems(response);
  } catch {
    return [];
  }
};

export const getAdminOrders = async () => {
  const response = await api.get<ApiEnvelope<unknown[]>>('/admin/orders');
  return unwrapItems(response);
};

export const getPendingReviews = async () => {
  const response = await api.get<ApiEnvelope<unknown[]>>('/admin/reviews/pending');
  return unwrapItems(response);
};

export const moderateReview = async (reviewId: string, status: 'APPROVED' | 'REJECTED') => {
  const response = await api.post<ApiEnvelope<unknown>>(`/admin/reviews/${reviewId}/moderate`, { status });
  return unwrapData(response, null);
};

export const reviewCertification = async (
  storeId: string,
  status: 'APPROVED' | 'REJECTED',
  notes?: string,
) => {
  const response = await api.post<ApiEnvelope<unknown>>(`/admin/stores/${storeId}/certification-review`, { status, notes });
  return unwrapData(response, null);
};

export const getAllUsers = async (page: number = 1, limit: number = 20) => {
  const response = await api.get<ApiEnvelope<AdminListResponse<User>>>(`/admin/users?page=${page}&limit=${limit}`);
  return unwrapData(response, { items: [] });
};

export const updateUserRole = async (userId: string, role: string) => {
  const response = await api.patch<ApiEnvelope<unknown>>(`/admin/users/${userId}/role`, { role });
  return unwrapData(response, null);
};

export const getAllStores = async (page: number = 1, limit: number = 20) => {
  const response = await api.get<ApiEnvelope<AdminListResponse<Store>>>(`/admin/stores?page=${page}&limit=${limit}`);
  return unwrapData(response, { items: [] });
};

export const deleteStore = async (storeId: string) => {
  const response = await api.delete<ApiEnvelope<unknown>>(`/admin/stores/${storeId}`);
  return unwrapData(response, null);
};
