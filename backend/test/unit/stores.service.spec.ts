import { Test, TestingModule } from '@nestjs/testing';
import { StoresService } from '../../src/modules/stores/stores.service';
import { PrismaService } from '../../src/config/database';
import { ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';

describe('StoresService', () => {
  let service: StoresService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    store: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    product: {
      count: jest.fn(),
    },
    favorite: {
      count: jest.fn(),
    },
  };

  const mockStore = {
    id: 'store-uuid-1',
    name: 'Test Store',
    logoUrl: 'https://example.com/logo.jpg',
    description: 'A test store',
    category: 'FOOD',
    whatsappNumber: '966501234567',
    instagramHandle: 'teststore',
    isVerified: false,
    ownerId: 'user-uuid-1',
    latitude: 24.7136,
    longitude: 46.6753,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    owner: {
      id: 'user-uuid-1',
      email: 'seller@test.com',
      city: 'Riyadh',
      phone: '0501234567',
    },
    products: [],
  };

  const mockUser = {
    id: 'user-uuid-1',
    email: 'seller@test.com',
    role: 'SELLER',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new store successfully', async () => {
      const createStoreDto = {
        name: 'Test Store',
        description: 'A test store description',
        category: 'FOOD',
        whatsappNumber: '966501234567',
        logoUrl: 'https://example.com/logo.jpg',
        latitude: 24.7136,
        longitude: 46.6753,
        instagramHandle: 'teststore',
      };

      mockPrismaService.store.create.mockResolvedValue(mockStore);

      const result = await service.create(createStoreDto, mockUser.id);

      expect(mockPrismaService.store.create).toHaveBeenCalledWith({
        data: {
          ...createStoreDto,
          ownerId: mockUser.id,
          isVerified: false,
        },
        include: {
          owner: true,
        },
      });

      expect(result).toEqual(mockStore);
    });

    it('should create store without optional fields', async () => {
      const createStoreDto = {
        name: 'Test Store',
        description: 'A test store description',
        category: 'FOOD',
        whatsappNumber: '966501234567',
      };

      const storeWithoutOptional = {
        ...mockStore,
        logoUrl: null,
        latitude: null,
        longitude: null,
        instagramHandle: null,
      };

      mockPrismaService.store.create.mockResolvedValue(storeWithoutOptional);

      const result = await service.create(createStoreDto, mockUser.id);

      expect(result.logoUrl).toBeNull();
      expect(result.latitude).toBeNull();
      expect(result.longitude).toBeNull();
      expect(result.instagramHandle).toBeNull();
    });

    it('should throw ForbiddenException if user already has a verified store', async () => {
      const createStoreDto = {
        name: 'Test Store',
        description: 'A test store description',
        category: 'FOOD',
        whatsappNumber: '966501234567',
      };

      mockPrismaService.store.findFirst.mockResolvedValue({
        ...mockStore,
        isVerified: true,
      });

      await expect(service.create(createStoreDto, mockUser.id)).rejects.toThrow(
        ForbiddenException
      );

      expect(mockPrismaService.store.findFirst).toHaveBeenCalledWith({
        where: {
          ownerId: mockUser.id,
          isVerified: true,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all stores for admin', async () => {
      const adminUser = {
        id: 'admin-uuid-1',
        email: 'admin@test.com',
        role: 'ADMIN',
      };

      const stores = [mockStore, { ...mockStore, id: 'store-uuid-2' }];

      mockPrismaService.store.findMany.mockResolvedValue(stores);
      mockPrismaService.store.count.mockResolvedValue(2);

      const result = await service.findAll(adminUser, {});

      expect(mockPrismaService.store.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          owner: {
            select: {
              email: true,
              city: true,
              phone: true,
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result.stores).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should return only user\'s own stores for seller', async () => {
      const stores = [mockStore];

      mockPrismaService.store.findMany.mockResolvedValue(stores);
      mockPrismaService.store.count.mockResolvedValue(1);

      const result = await service.findAll(mockUser, {});

      expect(mockPrismaService.store.findMany).toHaveBeenCalledWith({
        where: {
          ownerId: mockUser.id,
        },
        include: {
          owner: {
            select: {
              email: true,
              city: true,
              phone: true,
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result.stores).toHaveLength(1);
    });

    it('should filter stores by verification status', async () => {
      mockPrismaService.store.findMany.mockResolvedValue([mockStore]);
      mockPrismaService.store.count.mockResolvedValue(1);

      await service.findAll(mockUser, { verified: false });

      expect(mockPrismaService.store.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isVerified: false,
          }),
        })
      );
    });

    it('should filter stores by category', async () => {
      mockPrismaService.store.findMany.mockResolvedValue([mockStore]);
      mockPrismaService.store.count.mockResolvedValue(1);

      await service.findAll(mockUser, { category: 'FOOD' });

      expect(mockPrismaService.store.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'FOOD',
          }),
        })
      );
    });

    it('should handle pagination', async () => {
      mockPrismaService.store.findMany.mockResolvedValue([mockStore]);
      mockPrismaService.store.count.mockResolvedValue(10);

      const result = await service.findAll(mockUser, { page: 2, limit: 5 });

      expect(mockPrismaService.store.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );

      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 10,
        totalPages: 2,
      });
    });
  });

  describe('findOne', () => {
    it('should return a store by id', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);

      const result = await service.findOne(mockStore.id, mockUser);

      expect(mockPrismaService.store.findUnique).toHaveBeenCalledWith({
        where: {
          id: mockStore.id,
        },
        include: {
          owner: {
            select: {
              email: true,
              city: true,
              phone: true,
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      expect(result).toEqual(mockStore);
    });

    it('should throw NotFoundException if store not found', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id', mockUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should allow access to unverified store for owner', async () => {
      const unverifiedStore = { ...mockStore, isVerified: false };
      mockPrismaService.store.findUnique.mockResolvedValue(unverifiedStore);

      const result = await service.findOne(mockStore.id, mockUser);

      expect(result).toEqual(unverifiedStore);
    });

    it('should throw ForbiddenException for non-owner accessing unverified store', async () => {
      const otherUser = {
        id: 'other-user-uuid',
        email: 'other@test.com',
        role: 'SELLER',
      };

      const unverifiedStore = { ...mockStore, isVerified: false };
      mockPrismaService.store.findUnique.mockResolvedValue(unverifiedStore);

      await expect(service.findOne(mockStore.id, otherUser)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('update', () => {
    it('should update store successfully for owner', async () => {
      const updateStoreDto = {
        name: 'Updated Store Name',
        description: 'Updated description',
      };

      const updatedStore = { ...mockStore, ...updateStoreDto };
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.store.update.mockResolvedValue(updatedStore);

      const result = await service.update(mockStore.id, updateStoreDto, mockUser);

      expect(mockPrismaService.store.update).toHaveBeenCalledWith({
        where: {
          id: mockStore.id,
        },
        data: updateStoreDto,
        include: {
          owner: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      expect(result).toEqual(updatedStore);
    });

    it('should throw ForbiddenException if user is not store owner', async () => {
      const otherUser = {
        id: 'other-user-uuid',
        email: 'other@test.com',
        role: 'SELLER',
      };

      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);

      await expect(
        service.update(mockStore.id, {}, otherUser)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to update any store', async () => {
      const adminUser = {
        id: 'admin-uuid-1',
        email: 'admin@test.com',
        role: 'ADMIN',
      };

      const updateStoreDto = { name: 'Admin Updated' };
      const updatedStore = { ...mockStore, ...updateStoreDto };

      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.store.update.mockResolvedValue(updatedStore);

      const result = await service.update(mockStore.id, updateStoreDto, adminUser);

      expect(result).toEqual(updatedStore);
    });
  });

  describe('delete', () => {
    it('should delete store successfully', async () => {
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.store.delete.mockResolvedValue(mockStore);

      const result = await service.delete(mockStore.id, mockUser);

      expect(mockPrismaService.store.delete).toHaveBeenCalledWith({
        where: {
          id: mockStore.id,
        },
      });

      expect(result).toEqual(mockStore);
    });

    it('should throw ConflictException if store has products', async () => {
      mockPrismaService.product.count.mockResolvedValue(5);

      await expect(service.delete(mockStore.id, mockUser)).rejects.toThrow(
        ConflictException
      );
    });

    it('should throw ForbiddenException if user is not store owner', async () => {
      const otherUser = {
        id: 'other-user-uuid',
        email: 'other@test.com',
        role: 'SELLER',
      };

      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);

      await expect(service.delete(mockStore.id, otherUser)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should allow admin to delete any store', async () => {
      const adminUser = {
        id: 'admin-uuid-1',
        email: 'admin@test.com',
        role: 'ADMIN',
      };

      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.store.delete.mockResolvedValue(mockStore);

      const result = await service.delete(mockStore.id, adminUser);

      expect(result).toEqual(mockStore);
    });
  });

  describe('verifyStore', () => {
    it('should verify store successfully', async () => {
      const verifiedStore = { ...mockStore, isVerified: true };
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.store.update.mockResolvedValue(verifiedStore);

      const result = await service.verifyStore(mockStore.id, true);

      expect(mockPrismaService.store.update).toHaveBeenCalledWith({
        where: {
          id: mockStore.id,
        },
        data: {
          isVerified: true,
        },
        include: {
          owner: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      expect(result.isVerified).toBe(true);
    });

    it('should unverify store (reject)', async () => {
      const unverifiedStore = { ...mockStore, isVerified: false };
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.store.update.mockResolvedValue(unverifiedStore);

      const result = await service.verifyStore(mockStore.id, false);

      expect(result.isVerified).toBe(false);
    });

    it('should throw NotFoundException if store not found', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.verifyStore('non-existent-id', true)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('getSellerDashboard', () => {
    it('should return seller dashboard with stats', async () => {
      const stores = [
        {
          ...mockStore,
          _count: {
            products: 10,
          },
        },
      ];

      mockPrismaService.store.findMany.mockResolvedValue(stores);
      mockPrismaService.favorite.count.mockResolvedValue(25);

      const result = await service.getSellerDashboard(mockUser.id);

      expect(mockPrismaService.store.findMany).toHaveBeenCalledWith({
        where: {
          ownerId: mockUser.id,
        },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result.stores).toHaveLength(1);
      expect(result.stores[0].stats).toEqual({
        totalProducts: 10,
        totalFavorites: 25,
        recentProducts: expect.any(Number),
      });
    });

    it('should calculate recent products (last 7 days)', async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const stores = [
        {
          ...mockStore,
          _count: {
            products: 10,
          },
        },
      ];

      mockPrismaService.store.findMany.mockResolvedValue(stores);
      mockPrismaService.product.count.mockResolvedValue(3);

      const result = await service.getSellerDashboard(mockUser.id);

      expect(mockPrismaService.product.count).toHaveBeenCalledWith({
        where: {
          storeId: mockStore.id,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      });

      expect(result.stores[0].stats.recentProducts).toBe(3);
    });
  });
});
