import apiService, { ApiEnvelope, unwrapData, unwrapItems } from './api';
import { Category } from '../types';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  inventoryQuantity: number;
  isActive: boolean;
  imageUrls: string[];
  category: Category;
  originAddressText?: string;
  originCity?: string;
  originLatitude?: number;
  originLongitude?: number;
  storeId: string;
  store: {
    id: string;
    name: string;
    logoUrl?: string;
    addressText?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    category: Category;
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
  inventoryQuantity: number;
  isActive?: boolean;
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
  const response = await apiService.get<ApiEnvelope<Product[] | { items?: Product[] }>>('/products', { params });
  return unwrapItems<Product>(response);
};

export const getProductDetail = async (id: string): Promise<Product> => {
  const response = await apiService.get<ApiEnvelope<Product>>(`/products/${id}`);
  return unwrapData<Product | undefined>(response, undefined) as Product;
};

export const addFavorite = async (productId: string) => {
  return apiService.post(`/products/${productId}/favorite`);
};

export const removeFavorite = async (productId: string) => {
  return apiService.delete(`/products/${productId}/favorite`);
};

export const getUserFavorites = async (params?: { page?: number; limit?: number }) => {
  const response = await apiService.get<ApiEnvelope<unknown[] | { items?: unknown[] }>>('/products/favorites/me', { params });
  return unwrapItems<unknown>(response);
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
  const response = await apiService.post<ApiEnvelope<Product>>('/products', data);
  return unwrapData<Product | undefined>(response, undefined) as Product;
};

export const updateProduct = async (
  productId: string,
  data: Partial<CreateProductData>,
): Promise<Product> => {
  const response = await apiService.patch<ApiEnvelope<Product>>(`/products/${productId}`, data);
  return unwrapData<Product | undefined>(response, undefined) as Product;
};

export const deleteProduct = async (productId: string): Promise<void> => {
  await apiService.delete(`/products/${productId}`);
};

export const getSellerProducts = async (storeId: string): Promise<Product[]> => {
  const response = await apiService.get<ApiEnvelope<Product[] | { items?: Product[] }>>('/products', { params: { storeId } });
  return unwrapItems<Product>(response);
};
