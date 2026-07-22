import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHash } from 'crypto';

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_IMAGES = 5;
const DATA_URL_PATTERN = /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/;

interface CloudinaryUploadResponse {
  secure_url?: string;
  error?: { message?: string };
}

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  async uploadProductImages(images: string[]): Promise<string[]> {
    if (!Array.isArray(images) || images.length < 1 || images.length > MAX_IMAGES) {
      throw new BadRequestException(`Upload between 1 and ${MAX_IMAGES} images`);
    }

    images.forEach((image) => this.validateDataUrl(image));
    return Promise.all(images.map((image) => this.uploadToCloudinary(image)));
  }

  async deleteByUrl(url: string): Promise<void> {
    const publicId = this.publicIdFromUrl(url);
    if (!publicId) return;

    const config = this.cloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.sign(`public_id=${publicId}&timestamp=${timestamp}`, config.apiSecret);
    const body = new FormData();
    body.set('public_id', publicId);
    body.set('timestamp', String(timestamp));
    body.set('api_key', config.apiKey);
    body.set('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`,
      { method: 'POST', body },
    );

    if (!response.ok) {
      this.logger.warn(`Cloudinary cleanup failed with status ${response.status}`);
    }
  }

  private validateDataUrl(image: string): void {
    const match = DATA_URL_PATTERN.exec(image);
    if (!match) {
      throw new BadRequestException('Images must be JPEG, PNG, or WebP data URLs');
    }

    const size = Buffer.byteLength(match[2], 'base64');
    if (size === 0 || size > MAX_IMAGE_BYTES) {
      throw new BadRequestException('Each image must be between 1 byte and 4 MB');
    }
  }

  private async uploadToCloudinary(image: string): Promise<string> {
    const config = this.cloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'watani/products';
    const signature = this.sign(`folder=${folder}&timestamp=${timestamp}`, config.apiSecret);
    const body = new FormData();
    body.set('file', image);
    body.set('folder', folder);
    body.set('timestamp', String(timestamp));
    body.set('api_key', config.apiKey);
    body.set('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
      { method: 'POST', body },
    );
    const result = (await response.json()) as CloudinaryUploadResponse;

    if (!response.ok || !result.secure_url) {
      this.logger.error(`Cloudinary upload failed: ${result.error?.message ?? response.status}`);
      throw new ServiceUnavailableException('Image upload is temporarily unavailable');
    }

    return result.secure_url;
  }

  private cloudinaryConfig() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException('Image storage is not configured');
    }

    return { cloudName, apiKey, apiSecret };
  }

  private sign(value: string, secret: string): string {
    return createHash('sha1').update(`${value}${secret}`).digest('hex');
  }

  private publicIdFromUrl(url: string): string | null {
    if (!url.includes('res.cloudinary.com/') || !url.includes('/image/upload/')) return null;
    const path = url.split('/image/upload/')[1]?.replace(/^v\d+\//, '').replace(/\.[^.]+$/, '');
    return path ? decodeURIComponent(path) : null;
  }
}
