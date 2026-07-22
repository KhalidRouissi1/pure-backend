import { DiscoveryGroup, Product } from '../types';
import apiService, { ApiEnvelope, unwrapData } from './api';

export const getDiscoveryFeed = async (params: {
  groupBy: 'category' | 'region';
  limit?: number;
}) => {
  const response = await apiService.get<ApiEnvelope<{ groups?: DiscoveryGroup[] }>>('/discovery', { params });
  return unwrapData(response, { groups: [] });
};

export const getTrendingProducts = async (params?: { period?: string; limit?: number }) => {
  const response = await apiService.get<ApiEnvelope<{ trending?: Product[] }>>('/discovery/trending', { params });
  return unwrapData(response, { trending: [] });
};

export const getNewProducts = async (params?: { days?: number; limit?: number }) => {
  const response = await apiService.get<ApiEnvelope<{ newProducts?: Product[] }>>('/discovery/new', { params });
  return unwrapData(response, { newProducts: [] });
};

export const getCategories = async () => {
  const response = await apiService.get<ApiEnvelope<string[]>>('/discovery/categories');
  return unwrapData(response, []);
};
