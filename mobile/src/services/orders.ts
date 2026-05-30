import api from './api';
import { Order } from '../types';

export const checkout = async (data: {
  addressId?: string;
  paymentMethod: string;
  paymentStatus?: 'PENDING' | 'CONFIRMED';
}): Promise<Order> => {
  const response: any = await api.post('/checkout', data);
  return response?.data;
};

export const getOrders = async (): Promise<Order[]> => {
  const response: any = await api.get('/orders');
  return response?.data || [];
};

export const getOrder = async (id: string): Promise<Order> => {
  const response: any = await api.get(`/orders/${id}`);
  return response?.data;
};
