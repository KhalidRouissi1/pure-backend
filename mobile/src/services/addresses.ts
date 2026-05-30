import api from './api';
import { Address } from '../types';

export type AddressInput = Omit<Address, 'id'>;

export const getAddresses = async (): Promise<Address[]> => {
  const response: any = await api.get('/addresses');
  return response?.data || [];
};

export const createAddress = async (data: AddressInput): Promise<Address> => {
  const response: any = await api.post('/addresses', data);
  return response?.data;
};

export const updateAddress = async (id: string, data: Partial<AddressInput>): Promise<Address> => {
  const response: any = await api.patch(`/addresses/${id}`, data);
  return response?.data;
};

export const deleteAddress = async (id: string): Promise<void> => {
  await api.delete(`/addresses/${id}`);
};
