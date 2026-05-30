import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../../src/modules/products/products.service';
import { PrismaService } from '../../src/config/database';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  const mockPrisma = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    favorite: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    store: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', store: { isVerified: true } },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(1);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it('should filter by category', async () => {
      await service.findAll({ page: 1, limit: 20, category: 'FOOD' });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'FOOD',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const mockProduct = {
        id: '1',
        name: 'Product 1',
        store: { isVerified: true },
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('1', null);

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
    });
  });

  describe('favorites', () => {
    it('should add product to favorites', async () => {
      const mockFavorite = {
        id: 'fav-1',
        userId: 'user-1',
        productId: 'product-1',
      };

      mockPrisma.favorite.create.mockResolvedValue(mockFavorite);

      const result = await service.addFavorite('user-1', 'product-1');

      expect(mockPrisma.favorite.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          productId: 'product-1',
        },
      });

      expect(result).toBeDefined();
    });

    it('should remove product from favorites', async () => {
      const mockFavorite = {
        id: 'fav-1',
        userId: 'user-1',
        productId: 'product-1',
      };

      mockPrisma.favorite.findUnique.mockResolvedValue(mockFavorite);
      mockPrisma.favorite.delete.mockResolvedValue(mockFavorite);

      await service.removeFavorite('user-1', 'product-1');

      expect(mockPrisma.favorite.delete).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId: 'user-1',
            productId: 'product-1',
          },
        },
      });
    });

    it('should get user favorites', async () => {
      const mockFavorites = [
        {
          id: 'fav-1',
          product: {
            id: '1',
            name: 'Product 1',
            store: { name: 'Store 1' },
          },
        },
      ];

      mockPrisma.favorite.findMany.mockResolvedValue(mockFavorites);

      const result = await service.getUserFavorites('user-1', { page: 1, limit: 20 });

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(1);
    });

    it('should throw error if product already favorited', async () => {
      mockPrisma.favorite.findUnique.mockResolvedValue({ id: 'existing-fav' });

      await expect(
        service.addFavorite('user-1', 'product-1'),
      ).rejects.toThrow('Product already in favorites');
    });
  });
});
