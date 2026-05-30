import api from './api';

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
    const response: any = await api.get('/admin/pending-stores');
    return response?.data || [];
  } catch {
    return [];
  }
};

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  try {
    const response: any = await api.get('/admin/dashboard');
    return response?.data?.stats || defaultStats;
  } catch {
    return defaultStats;
  }
};

export const getAdminDashboardFull = async () => {
  try {
    const response: any = await api.get('/admin/dashboard');
    return response?.data || {};
  } catch {
    return {};
  }
};

export const getRecentStores = async (limit: number = 10) => {
  try {
    const response: any = await api.get(`/admin/stores/recent?limit=${limit}`);
    return response?.data || [];
  } catch {
    return [];
  }
};

export const getRecentProducts = async (limit: number = 10) => {
  try {
    const response: any = await api.get(`/admin/products/recent?limit=${limit}`);
    return response?.data || [];
  } catch {
    return [];
  }
};

export const getAdminOrders = async () => {
  const response: any = await api.get('/admin/orders');
  return response?.data || [];
};

export const getPendingReviews = async () => {
  const response: any = await api.get('/admin/reviews/pending');
  return response?.data || [];
};

export const moderateReview = async (reviewId: string, status: 'APPROVED' | 'REJECTED') => {
  const response: any = await api.post(`/admin/reviews/${reviewId}/moderate`, { status });
  return response?.data;
};

export const reviewCertification = async (
  storeId: string,
  status: 'APPROVED' | 'REJECTED',
  notes?: string,
) => {
  const response: any = await api.post(`/admin/stores/${storeId}/certification-review`, { status, notes });
  return response?.data;
};

export const getAllUsers = async (page: number = 1, limit: number = 20) => {
  const response: any = await api.get(`/admin/users?page=${page}&limit=${limit}`);
  return response?.data;
};

export const updateUserRole = async (userId: string, role: string) => {
  const response: any = await api.patch(`/admin/users/${userId}/role`, { role });
  return response?.data;
};

export const getAllStores = async (page: number = 1, limit: number = 20) => {
  const response: any = await api.get(`/admin/stores?page=${page}&limit=${limit}`);
  return response?.data;
};

export const deleteStore = async (storeId: string) => {
  const response: any = await api.delete(`/admin/stores/${storeId}`);
  return response?.data;
};
