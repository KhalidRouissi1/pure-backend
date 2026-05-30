import api from './api';

export interface ImageUploadResult {
  url: string;
  publicId: string;
}

export const uploadImagesToCloudinary = async (
  base64Images: string[]
): Promise<string[]> => {
  try {
    // Just return base64 images as-is (no Cloudinary upload needed)
    return base64Images;
  } catch (error) {
    console.error('Failed to process images:', error);
    throw new Error('Failed to process images');
  }
};

export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    // Base64 images don't need external cleanup
    console.log(`Processing delete for image: ${publicId}`);
  } catch (error) {
    console.error('Failed to process delete:', error);
    throw new Error('Failed to delete image');
  }
};
