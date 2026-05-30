import apiService from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  category: string;
  originAddressText?: string;
  originCity?: string;
  originLatitude?: number;
  originLongitude?: number;
  storeId: string;
  store?: {
    id: string;
    name: string;
    logoUrl?: string;
    addressText?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    category: string;
    whatsappNumber: string;
    instagramHandle?: string;
    isVerified: boolean;
    trustedBadge?: boolean;
  };
  createdAt: string;
  updatedAt: string;
  isFavorited?: boolean;
  _count?: {
    favorites: number;
  };
  averageRating?: number;
  reviewCount?: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrls?: string[];
  storeId?: string;
  originAddressText?: string;
  originCity?: string;
  originLatitude?: number;
  originLongitude?: number;
}

export const getProducts = async (params?: {
  category?: string;
  storeId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}) => {
  const response: any = await apiService.get('/products', { params });
  return response?.data?.items || response?.data || [];
};

export const getProductDetail = async (id: string) => {
  const response: any = await apiService.get(`/products/${id}`);
  return response?.data;
};

export const addFavorite = async (productId: string) => {
  return apiService.post(`/products/${productId}/favorite`);
};

export const removeFavorite = async (productId: string) => {
  return apiService.delete(`/products/${productId}/favorite`);
};

export const getUserFavorites = async (params?: { page?: number; limit?: number }) => {
  const response: any = await apiService.get('/products/favorites/me', { params });
  return response?.data?.items || response?.data || [];
};

export const toggleFavorite = async (productId: string, action?: 'add' | 'remove') => {
  if (action === 'remove') {
    return await removeFavorite(productId);
  }
  if (action === 'add') {
    return await addFavorite(productId);
  }

  try {
    return await addFavorite(productId);
  } catch (error: any) {
    if (error?.message?.includes('already') || error?.statusCode === 409) {
      return await removeFavorite(productId);
    }
    throw error;
  }
};

export const createProduct = async (data: CreateProductData): Promise<Product> => {
  const response: any = await apiService.post('/products', data);
  return response?.data;
};

export const updateProduct = async (
  productId: string,
  data: Partial<CreateProductData>,
): Promise<Product> => {
  const response: any = await apiService.patch(`/products/${productId}`, data);
  return response?.data;
};

export const deleteProduct = async (productId: string): Promise<void> => {
  await apiService.delete(`/products/${productId}`);
};

export const getSellerProducts = async (storeId: string): Promise<Product[]> => {
  const response: any = await apiService.get('/products', { params: { storeId } });
  return response?.data?.items || response?.data || [];
};
