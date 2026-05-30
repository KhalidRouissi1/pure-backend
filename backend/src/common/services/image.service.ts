import { Injectable, ForbiddenException, Logger } from '@nestjs/common';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  async validateBase64Image(base64: string): Promise<boolean> {
    if (!base64 || typeof base64 !== 'string') {
      return false;
    }

    const base64Regex = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/i;
    return base64Regex.test(base64);
  }

  async processBase64Images(images: string[]): Promise<string[]> {
    if (!images || images.length === 0) {
      throw new ForbiddenException('At least one image is required');
    }

    if (images.length > 5) {
      throw new ForbiddenException('Maximum 5 images allowed');
    }

    const processedImages = [];

    for (const image of images) {
      if (!await this.validateBase64Image(image)) {
        throw new ForbiddenException('Invalid image format. Only JPEG, PNG, WebP, and GIF are supported.');
      }
      processedImages.push(image);
    }

    this.logger.log(`Successfully processed ${processedImages.length} images`);
    return processedImages;
  }
}
