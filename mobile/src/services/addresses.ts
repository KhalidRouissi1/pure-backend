import api, { ApiEnvelope, unwrapData, unwrapItems } from './api';
import { Address } from '../types';

export type AddressInput = Omit<Address, 'id'>;

export const getAddresses = async (): Promise<Address[]> => {
  const response = await api.get<ApiEnvelope<Address[]>>('/addresses');
  return unwrapItems<Address>(response);
};

export const createAddress = async (data: AddressInput): Promise<Address> => {
  const response = await api.post<ApiEnvelope<Address>>('/addresses', data);
  return unwrapData<Address | undefined>(response, undefined) as Address;
};

export const updateAddress = async (id: string, data: Partial<AddressInput>): Promise<Address> => {
  const response = await api.patch<ApiEnvelope<Address>>(`/addresses/${id}`, data);
  return unwrapData<Address | undefined>(response, undefined) as Address;
};

export const deleteAddress = async (id: string): Promise<void> => {
  await api.delete(`/addresses/${id}`);
};
