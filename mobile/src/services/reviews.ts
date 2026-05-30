import api from './api';
import { Review } from '../types';

export const getProductReviews = async (productId: string): Promise<{ reviews: Review[]; summary: { count: number; averageRating: number } }> => {
  const response: any = await api.get(`/products/${productId}/reviews`);
  return response?.data || { reviews: [], summary: { count: 0, averageRating: 0 } };
};

export const createProductReview = async (productId: string, rating: number, comment?: string): Promise<Review> => {
  const response: any = await api.post(`/products/${productId}/reviews`, { rating, comment });
  return response?.data;
};

export const getStoreReviews = async (storeId: string): Promise<{ reviews: Review[]; summary: { count: number; averageRating: number } }> => {
  const response: any = await api.get(`/stores/${storeId}/reviews`);
  return response?.data || { reviews: [], summary: { count: 0, averageRating: 0 } };
};

export const createStoreReview = async (storeId: string, rating: number, comment?: string): Promise<Review> => {
  const response: any = await api.post(`/stores/${storeId}/reviews`, { rating, comment });
  return response?.data;
};
