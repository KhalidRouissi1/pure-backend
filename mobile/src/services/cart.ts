import api, { ApiEnvelope, unwrapData } from './api';
import { Cart } from '../types';

const emptyCart: Cart = { items: [], subtotal: 0, totalItems: 0 };

export const getCart = async (): Promise<Cart> => {
  const response = await api.get<ApiEnvelope<Cart>>('/cart');
  return unwrapData(response, emptyCart);
};

export const addToCart = async (productId: string, quantity: number = 1): Promise<Cart> => {
  const response = await api.post<ApiEnvelope<Cart>>('/cart', { productId, quantity });
  return unwrapData(response, emptyCart);
};

export const updateCartItem = async (itemId: string, quantity: number): Promise<Cart> => {
  const response = await api.patch<ApiEnvelope<Cart>>(`/cart/${itemId}`, { quantity });
  return unwrapData(response, emptyCart);
};

export const removeCartItem = async (itemId: string): Promise<Cart> => {
  const response = await api.delete<ApiEnvelope<Cart>>(`/cart/${itemId}`);
  return unwrapData(response, emptyCart);
};

export const clearCart = async (): Promise<Cart> => {
  const response = await api.delete<ApiEnvelope<Cart>>('/cart');
  return unwrapData(response, emptyCart);
};
