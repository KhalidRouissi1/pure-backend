import api from './api';

export interface Store {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  galleryUrls?: string[];
  category: string;
  addressText?: string;
  city?: string;
  whatsappNumber: string;
  instagramHandle?: string;
  latitude?: number;
  longitude?: number;
  isVerified: boolean;
  certificationUrl?: string;
  certificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  certificationNotes?: string;
  trustedBadge?: boolean;
  averageRating?: number;
  reviewCount?: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    email: string;
    city?: string;
    phone?: string;
  };
  _count?: {
    products: number;
  };
}

export interface DashboardStats {
  totalStores: number;
  totalProducts: number;
  totalFavorites: number;
  verifiedStores: number;
}

export interface StoreWithStats extends Store {
  stats?: {
    totalProducts: number;
    totalFavorites: number;
    recentProducts: number;
  };
}

export const getSellerStores = async (): Promise<StoreWithStats[]> => {
  try {
    const response: any = await api.get('/stores/me/dashboard');
    return response?.data?.stores || [];
  } catch {
    return [];
  }
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const stores = await getSellerStores();
    return {
      totalStores: stores.length,
      totalProducts: stores.reduce((sum, store) => sum + (store._count?.products || 0), 0),
      verifiedStores: stores.filter((store) => store.isVerified).length,
      totalFavorites: stores.reduce((sum, store) => sum + (store.stats?.totalFavorites || 0), 0),
    };
  } catch {
    return { totalStores: 0, totalProducts: 0, totalFavorites: 0, verifiedStores: 0 };
  }
};

export interface CreateStoreData {
  name: string;
  description: string;
  category: string;
  whatsappNumber: string;
  instagramHandle?: string;
  logoUrl?: string;
  galleryUrls?: string[];
  certificationUrl?: string;
  addressText?: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export const createStore = async (data: CreateStoreData): Promise<Store> => {
  const response: any = await api.post('/stores', data);
  return response?.data;
};

export const updateStore = async (
  storeId: string,
  data: Partial<CreateStoreData>,
): Promise<Store> => {
  const response: any = await api.patch(`/stores/${storeId}`, data);
  return response?.data;
};

export const deleteStore = async (storeId: string): Promise<void> => {
  await api.delete(`/stores/${storeId}`);
};

export const verifyStore = async (storeId: string, isVerified: boolean): Promise<Store> => {
  const response: any = await api.post(`/stores/${storeId}/verify`, { isVerified });
  return response?.data;
};

export const getStores = async (params?: {
  verified?: boolean;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<Store[]> => {
  const response: any = await api.get('/stores', { params });
  return response?.data || [];
};

export const getStore = async (storeId: string): Promise<Store> => {
  const response: any = await api.get(`/stores/${storeId}`);
  return response?.data;
};

export const submitCertification = async (storeId: string, certificationUrl: string): Promise<Store> => {
  const response: any = await api.post(`/stores/${storeId}/certification`, { certificationUrl });
  return response?.data;
};
