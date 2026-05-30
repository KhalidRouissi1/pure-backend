import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryService } from '../../src/modules/discovery/discovery.service';
import { PrismaService } from '../../src/config/database';

describe('DiscoveryService', () => {
  let service: DiscoveryService;
  let prisma: PrismaService;

  const mockPrisma = {
    product: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    store: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscoveryService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<DiscoveryService>(DiscoveryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDiscoveryFeed', () => {
    it('should group products by category', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', category: 'FOOD', store: { isVerified: true } },
        { id: '2', name: 'Product 2', category: 'FOOD', store: { isVerified: true } },
        { id: '3', name: 'Product 3', category: 'FASHION', store: { isVerified: true } },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.getDiscoveryFeed({ groupBy: 'category', limit: 10 });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          store: {
            isVerified: true,
          },
        },
        include: {
          store: true,
        },
      });

      expect(result).toBeDefined();
      expect(result.groups).toBeDefined();
    });

    it('should group products by region', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', store: { city: 'Riyadh', isVerified: true } },
        { id: '2', name: 'Product 2', store: { city: 'Jeddah', isVerified: true } },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.getDiscoveryFeed({ groupBy: 'region', limit: 10 });

      expect(result).toBeDefined();
      expect(result.groups).toBeDefined();
    });
  });

  describe('getTrendingProducts', () => {
    it('should return trending products based on favorites count', async () => {
      const mockTrending = [
        { id: '1', name: 'Trending Product', _count: { favorites: 10 } },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockTrending);

      const result = await service.getTrendingProducts({ period: '7d', limit: 20 });

      expect(result).toBeDefined();
      expect(result.trending).toBeDefined();
    });
  });

  describe('getNewProducts', () => {
    it('should return products from last N days', async () => {
      const mockNewProducts = [
        { id: '1', name: 'New Product', createdAt: new Date() },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockNewProducts);

      const result = await service.getNewProducts({ days: 7, limit: 20 });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.any(Object),
          }),
        }),
      );

      expect(result).toBeDefined();
      expect(result.newProducts).toBeDefined();
    });
  });
});
