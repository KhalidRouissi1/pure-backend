import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProductsService } from '../../src/modules/products/products.service';

describe('ProductsService', () => {
  const prisma = {
    product: { findMany: jest.fn(), count: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
    store: { findUnique: jest.fn(), findFirst: jest.fn() },
    user: { findUnique: jest.fn() },
    favorite: { findMany: jest.fn() },
  } as any;
  const imageService = { uploadProductImages: jest.fn(), deleteByUrl: jest.fn() } as any;
  const service = new ProductsService(prisma, imageService);

  beforeEach(() => jest.clearAllMocks());

  it('only lists products from verified stores for public browsing', async () => {
    prisma.product.findMany.mockResolvedValue([]);
    prisma.product.count.mockResolvedValue(0);

    const result = await service.findAll({ page: 1, limit: 20 });

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { store: { isVerified: true }, isActive: true, inventoryQuantity: { gt: 0 } } }),
    );
    expect(result.data.pagination.total).toBe(0);
  });

  it('prevents ordinary users from creating products', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-id', role: 'USER' });

    await expect(service.create({} as any, 'user-id')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('requires a seller to own a store before creating a product', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'seller-id', role: 'SELLER' });
    prisma.store.findFirst.mockResolvedValue(null);

    await expect(service.create({} as any, 'seller-id')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('delegates uploads to the server-side image service', async () => {
    imageService.uploadProductImages.mockResolvedValue(['https://example.com/image.jpg']);
    await expect(service.uploadProductImages(['data:image/jpeg;base64,aGk='])).resolves.toEqual([
      'https://example.com/image.jpg',
    ]);
  });
});
