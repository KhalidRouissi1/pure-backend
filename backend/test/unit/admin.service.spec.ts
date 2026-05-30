import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from '../../src/modules/admin/admin.service';
import { PrismaService } from '../../src/config/database';
import { NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: PrismaService;

  const mockPrismaService = {
    store: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      groupBy: jest.fn(),
    },
    product: {
      count: jest.fn(),
    },
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    order: {
      count: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
    review: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getPendingStores', () => {
    it('should return all pending stores', async () => {
      const mockStore = {
        id: 'store-1',
        name: 'Test Store',
        description: 'Test description',
        category: 'HONEY',
        whatsappNumber: '966501234567',
        isVerified: false,
        ownerId: 'user-1',
        createdAt: new Date('2024-01-01'),
        owner: { id: 'user-1', email: 'seller@example.com', city: 'Riyadh', phone: '0501234567' },
        _count: { products: 0 },
      };
      mockPrismaService.store.findMany.mockResolvedValue([mockStore]);

      const result = await service.getPendingStores();

      expect(result).toEqual([mockStore]);
      expect(mockPrismaService.store.findMany).toHaveBeenCalledWith({
        where: { isVerified: false },
        include: {
          owner: { select: { id: true, email: true, city: true, phone: true } },
          _count: { select: { products: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('should return empty array if no pending stores', async () => {
      mockPrismaService.store.findMany.mockResolvedValue([]);
      const result = await service.getPendingStores();
      expect(result).toEqual([]);
    });
  });

  describe('verifyStore', () => {
    it('should verify store successfully', async () => {
      const mockStore = { id: 'store-1', name: 'Test Store', isVerified: false };
      const verifiedStore = { ...mockStore, isVerified: true };
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.store.update.mockResolvedValue(verifiedStore);

      const result = await service.verifyStore('store-1', true);
      expect(result.isVerified).toBe(true);
    });

    it('should throw NotFoundException if store not found', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(null);
      await expect(service.verifyStore('nonexistent', true)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAdminDashboardStats', () => {
    it('should return comprehensive stats with order breakdown', async () => {
      mockPrismaService.user.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(25);
      mockPrismaService.store.count
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(10);
      mockPrismaService.product.count
        .mockResolvedValueOnce(500)
        .mockResolvedValueOnce(50);
      mockPrismaService.order.count
        .mockResolvedValueOnce(200)
        .mockResolvedValueOnce(40);
      mockPrismaService.order.groupBy.mockResolvedValue([
        { status: 'DELIVERED', _count: 100 },
        { status: 'PENDING', _count: 15 },
        { status: 'CANCELLED', _count: 15 },
      ]);
      mockPrismaService.order.aggregate.mockResolvedValue({
        _sum: { total: 50000, deliveryFee: 3000 },
        _avg: { total: 250 },
      });
      mockPrismaService.review.count.mockResolvedValue(5);
      mockPrismaService.store.count
        .mockResolvedValueOnce(3);

      const result = await service.getAdminDashboardStats();

      expect(result.totalUsers).toBe(100);
      expect(result.totalSellers).toBe(25);
      expect(result.totalStores).toBe(30);
      expect(result.totalOrders).toBe(200);
      expect(result.totalOrdersDelivered).toBe(100);
      expect(result.totalOrdersPending).toBe(15);
      expect(result.totalOrdersCancelled).toBe(15);
      expect(result.totalGmv).toBe(50000);
      expect(result.avgOrderValue).toBe(250);
    });
  });

  describe('getStoresByCategory', () => {
    it('should return stores grouped by category', async () => {
      const categoryStats = [
        { category: 'HONEY', _count: 10 },
        { category: 'DAIRY', _count: 5 },
      ];
      mockPrismaService.store.groupBy.mockResolvedValue(categoryStats);

      const result = await service.getStoresByCategory();
      expect(result).toEqual([
        { category: 'HONEY', count: 10 },
        { category: 'DAIRY', count: 5 },
      ]);
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const mockUsers = [{ id: 'u1', email: 'a@b.com', role: 'USER' }];
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await service.getUsers(1, 20);
      expect(result.items).toEqual(mockUsers);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('deleteStore', () => {
    it('should delete a store', async () => {
      mockPrismaService.store.delete.mockResolvedValue({ id: 'store-1' });
      await service.deleteStore('store-1');
      expect(mockPrismaService.store.delete).toHaveBeenCalledWith({ where: { id: 'store-1' } });
    });
  });
});
