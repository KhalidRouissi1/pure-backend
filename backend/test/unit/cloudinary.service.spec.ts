import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from '../../src/common/services/cloudinary.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

jest.mock('cloudinary');

describe('CloudinaryService', () => {
  let service: CloudinaryService;
  let configService: ConfigService;

  const mockUploadResult = {
    secure_url: 'https://res.cloudinary.com/test/image/upload/v123/test.jpg',
    public_id: 'test_public_id',
    format: 'jpg',
    bytes: 1024,
    width: 400,
    height: 400,
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload an image successfully', async () => {
      const fileBuffer = Buffer.from('test image data');
      const fileName = 'test-image.jpg';

      (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(mockUploadResult);

      const result = await service.uploadImage(fileBuffer, fileName);

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          folder: 'watani-local',
          public_id: expect.stringContaining('test-image'),
        })
      );

      expect(result).toEqual({
        url: mockUploadResult.secure_url,
        publicId: mockUploadResult.public_id,
      });
    });

    it('should throw InternalServerErrorException on upload failure', async () => {
      const fileBuffer = Buffer.from('test image data');
      const fileName = 'test-image.jpg';

      const error = new Error('Upload failed');
      (cloudinary.uploader.upload as jest.Mock).mockRejectedValue(error);

      await expect(service.uploadImage(fileBuffer, fileName)).rejects.toThrow(
        InternalServerErrorException
      );
    });

    it('should generate unique public_id with timestamp', async () => {
      const fileBuffer = Buffer.from('test image data');
      const fileName = 'test-image.jpg';

      (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(mockUploadResult);

      const timestamp = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(timestamp);

      await service.uploadImage(fileBuffer, fileName);

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          public_id: expect.stringMatching(/^watani-local\/test-image-\d+$/),
        })
      );
    });

    it('should handle file upload with valid extensions', async () => {
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];

      for (const ext of validExtensions) {
        const fileName = `test.${ext}`;
        const fileBuffer = Buffer.from('test data');

        (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(mockUploadResult);

        await service.uploadImage(fileBuffer, fileName);

        expect(cloudinary.uploader.upload).toHaveBeenCalled();
        jest.clearAllMocks();
      }
    });
  });

  describe('deleteImage', () => {
    it('should delete an image successfully', async () => {
      const publicId = 'test_public_id';

      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
        result: 'ok',
      });

      await service.deleteImage(publicId);

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(publicId);
    });

    it('should throw InternalServerErrorException on delete failure', async () => {
      const publicId = 'test_public_id';

      const error = new Error('Delete failed');
      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(error);

      await expect(service.deleteImage(publicId)).rejects.toThrow(
        InternalServerErrorException
      );
    });

    it('should handle delete with non-existent image', async () => {
      const publicId = 'non_existent_image';

      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
        result: 'not found',
      });

      const result = await service.deleteImage(publicId);

      expect(result).toBeUndefined();
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(publicId);
    });
  });

  describe('uploadMultipleImages', () => {
    it('should upload multiple images successfully', async () => {
      const files = [
        { buffer: Buffer.from('image1'), originalname: 'image1.jpg' },
        { buffer: Buffer.from('image2'), originalname: 'image2.jpg' },
        { buffer: Buffer.from('image3'), originalname: 'image3.jpg' },
      ];

      (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(mockUploadResult);

      const result = await service.uploadMultipleImages(files);

      expect(cloudinary.uploader.upload).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(3);
      expect(result).toEqual([
        {
          url: mockUploadResult.secure_url,
          publicId: mockUploadResult.public_id,
        },
        {
          url: mockUploadResult.secure_url,
          publicId: mockUploadResult.public_id,
        },
        {
          url: mockUploadResult.secure_url,
          publicId: mockUploadResult.public_id,
        },
      ]);
    });

    it('should throw error if array size exceeds maximum (5 images)', async () => {
      const files = Array(6).fill(null).map((_, i) => ({
        buffer: Buffer.from(`image${i}`),
        originalname: `image${i}.jpg`,
      }));

      await expect(service.uploadMultipleImages(files)).rejects.toThrow(
        'Maximum 5 images allowed'
      );
    });

    it('should throw error if array is empty', async () => {
      const files: any[] = [];

      await expect(service.uploadMultipleImages(files)).rejects.toThrow(
        'At least 1 image required'
      );
    });

    it('should continue uploading even if one image fails', async () => {
      const files = [
        { buffer: Buffer.from('image1'), originalname: 'image1.jpg' },
        { buffer: Buffer.from('image2'), originalname: 'image2.jpg' },
      ];

      (cloudinary.uploader.upload as jest.Mock)
        .mockResolvedValueOnce(mockUploadResult)
        .mockRejectedValueOnce(new Error('Upload failed'));

      const result = await service.uploadMultipleImages(files);

      expect(result).toHaveLength(1);
      expect(result[0].url).toBe(mockUploadResult.secure_url);
    });
  });

  describe('validateImageFile', () => {
    it('should validate valid image file', () => {
      const file = {
        buffer: Buffer.from('test'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      };

      expect(() => service.validateImageFile(file)).not.toThrow();
    });

    it('should throw error for invalid file type', () => {
      const file = {
        buffer: Buffer.from('test'),
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      };

      expect(() => service.validateImageFile(file)).toThrow(
        'Invalid file type'
      );
    });

    it('should throw error for file size exceeding 5MB', () => {
      const file = {
        buffer: Buffer.alloc(6 * 1024 * 1024), // 6MB
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 6 * 1024 * 1024,
      };

      expect(() => service.validateImageFile(file)).toThrow(
        'File size exceeds 5MB limit'
      );
    });

    it('should throw error for unsupported image format', () => {
      const file = {
        buffer: Buffer.from('test'),
        originalname: 'test.gif',
        mimetype: 'image/gif',
        size: 1024,
      };

      expect(() => service.validateImageFile(file)).toThrow(
        'Invalid file type'
      );
    });
  });

  describe('getThumbnailUrl', () => {
    it('should generate thumbnail URL with transformations', () => {
      const imageUrl = 'https://res.cloudinary.com/test/image/upload/v123/test.jpg';
      const expectedThumbnail = 'https://res.cloudinary.com/test/image/upload/w_400,h_400,c_fill/v123/test.jpg';

      const thumbnail = service.getThumbnailUrl(imageUrl, 400, 400);

      expect(thumbnail).toBe(expectedThumbnail);
    });

    it('should handle different thumbnail sizes', () => {
      const imageUrl = 'https://res.cloudinary.com/test/image/upload/v123/test.jpg';

      const thumb1 = service.getThumbnailUrl(imageUrl, 200, 200);
      const thumb2 = service.getThumbnailUrl(imageUrl, 800, 600);

      expect(thumb1).toContain('w_200,h_200,c_fill');
      expect(thumb2).toContain('w_800,h_600,c_fill');
    });
  });
});
