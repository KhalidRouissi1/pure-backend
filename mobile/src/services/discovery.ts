import { Category } from '../types';
import apiService from './api';

export const getDiscoveryFeed = async (params: {
  groupBy: 'category' | 'region';
  limit?: number;
}) => {
  return apiService.get('/discovery', { params });
};

export const getTrendingProducts = async (params?: { period?: string; limit?: number }) => {
  return apiService.get('/discovery/trending', { params });
};

export const getNewProducts = async (params?: { days?: number; limit?: number }) => {
  return apiService.get('/discovery/new', { params });
};

export const getCategories = async () => {
  return apiService.get('/discovery/categories');
};
