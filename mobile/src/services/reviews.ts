import api, { ApiEnvelope, unwrapData } from './api';
import { Review } from '../types';

const emptyReviewSummary = { reviews: [], summary: { count: 0, averageRating: 0 } };

export const getProductReviews = async (productId: string): Promise<{ reviews: Review[]; summary: { count: number; averageRating: number } }> => {
  const response = await api.get<ApiEnvelope<{ reviews: Review[]; summary: { count: number; averageRating: number } }>>(`/products/${productId}/reviews`);
  return unwrapData(response, emptyReviewSummary);
};

export const createProductReview = async (productId: string, rating: number, comment?: string): Promise<Review> => {
  const response = await api.post<ApiEnvelope<Review>>(`/products/${productId}/reviews`, { rating, comment });
  return unwrapData<Review | undefined>(response, undefined) as Review;
};

export const getStoreReviews = async (storeId: string): Promise<{ reviews: Review[]; summary: { count: number; averageRating: number } }> => {
  const response = await api.get<ApiEnvelope<{ reviews: Review[]; summary: { count: number; averageRating: number } }>>(`/stores/${storeId}/reviews`);
  return unwrapData(response, emptyReviewSummary);
};

export const createStoreReview = async (storeId: string, rating: number, comment?: string): Promise<Review> => {
  const response = await api.post<ApiEnvelope<Review>>(`/stores/${storeId}/reviews`, { rating, comment });
  return unwrapData<Review | undefined>(response, undefined) as Review;
};
