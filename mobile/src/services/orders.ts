import api, { ApiEnvelope, unwrapData, unwrapItems } from './api';
import { Order } from '../types';

export const checkout = async (data: {
  addressId?: string;
  paymentMethod: 'CASH_ON_DELIVERY' | 'CARD_ON_DELIVERY';
}): Promise<Order> => {
  const response = await api.post<ApiEnvelope<Order>>('/checkout', data);
  return unwrapData<Order | undefined>(response, undefined) as Order;
};

export const getOrders = async (): Promise<Order[]> => {
  const response = await api.get<ApiEnvelope<Order[]>>('/orders');
  return unwrapItems<Order>(response);
};

export const getOrder = async (id: string): Promise<Order> => {
  const response = await api.get<ApiEnvelope<Order>>(`/orders/${id}`);
  return unwrapData<Order | undefined>(response, undefined) as Order;
};
