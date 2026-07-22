import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { ImageService } from '../../src/common/services/image.service';

describe('ImageService', () => {
  const service = new ImageService();

  it('rejects empty uploads', async () => {
    await expect(service.uploadProductImages([])).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects unsupported and malformed image data', async () => {
    await expect(service.uploadProductImages(['file:///tmp/photo.jpg'])).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.uploadProductImages(['data:image/svg+xml;base64,PHN2Zz4='])).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('fails closed when image storage credentials are missing', async () => {
    const previous = {
      cloud: process.env.CLOUDINARY_CLOUD_NAME,
      key: process.env.CLOUDINARY_API_KEY,
      secret: process.env.CLOUDINARY_API_SECRET,
    };
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    try {
      await expect(
        service.uploadProductImages(['data:image/png;base64,aGVsbG8=']),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    } finally {
      const restore = (name: string, value: string | undefined) => {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      };
      restore('CLOUDINARY_CLOUD_NAME', previous.cloud);
      restore('CLOUDINARY_API_KEY', previous.key);
      restore('CLOUDINARY_API_SECRET', previous.secret);
    }
  });
});
