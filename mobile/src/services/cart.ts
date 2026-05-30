import api from './api';
import { Cart } from '../types';

export const getCart = async (): Promise<Cart> => {
  const response: any = await api.get('/cart');
  return response?.data || { items: [], subtotal: 0, totalItems: 0 };
};

export const addToCart = async (productId: string, quantity: number = 1): Promise<Cart> => {
  const response: any = await api.post('/cart', { productId, quantity });
  return response?.data;
};

export const updateCartItem = async (itemId: string, quantity: number): Promise<Cart> => {
  const response: any = await api.patch(`/cart/${itemId}`, { quantity });
  return response?.data;
};

export const removeCartItem = async (itemId: string): Promise<Cart> => {
  const response: any = await api.delete(`/cart/${itemId}`);
  return response?.data;
};

export const clearCart = async (): Promise<Cart> => {
  const response: any = await api.delete('/cart');
  return response?.data;
};
