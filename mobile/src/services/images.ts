import api, { ApiEnvelope, unwrapData } from './api';

export const uploadImages = async (imageDataUrls: string[]): Promise<string[]> => {
  const response = await api.post<ApiEnvelope<string[]>>('/products/upload-images', {
    images: imageDataUrls,
  });
  return unwrapData(response, []);
};
