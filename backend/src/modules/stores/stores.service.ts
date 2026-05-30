import { Injectable, ForbiddenException, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database';
import { CreateStoreDto, Category } from './dtos/create-store.dto';

interface PaginationOptions {
  page?: number;
  limit?: number;
  verified?: boolean;
  category?: Category;
}

interface PaginationResult<T> {
  items: T[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class StoresService {
  private readonly logger = new Logger(StoresService.name);

  constructor(private prisma: PrismaService) {}

  async create(createStoreDto: CreateStoreDto, userId: string) {
    this.logger.log(`Creating store for user: ${userId}`);

    // Check if user already has a verified store
    const existingVerifiedStore = await this.prisma.store.findFirst({
      where: {
        ownerId: userId,
        isVerified: true,
      },
    });

    if (existingVerifiedStore) {
      this.logger.warn(`User ${userId} already has a verified store`);
      throw new ForbiddenException('You already have a verified store');
    }

    const store = await this.prisma.store.create({
      data: {
        ...createStoreDto,
        ownerId: userId,
        isVerified: false,
      },
      include: {
        owner: true,
      },
    });

    if (createStoreDto.city) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { city: createStoreDto.city },
      });
    }

    this.logger.log(`Store created successfully: ${store.id}`);
    return store;
  }

  async findAll(userId: string, options: PaginationOptions = {}) {
    const { page = 1, limit = 20, verified, category } = options;
    const skip = (page - 1) * limit;

    this.logger.log(`Finding stores for user: ${userId}, options: ${JSON.stringify(options)}`);

    const where: any = {};
    
    // Regular users and sellers can only see their own unverified stores
    // Admins can see all stores
    // Everyone can see verified stores
    if (verified !== undefined) {
      where.isVerified = verified;
    }

    if (category) {
      where.category = category;
    }

    // Note: Additional filtering based on user role would be done at controller level
    // by passing the user role to this service

    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
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
          reviews: {
            where: { status: 'APPROVED' },
            select: { rating: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.store.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      stores: stores.map((store: any) => this.withRatingSummary(store)),
      total,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findOne(id: string, userId: string, userRole: string) {
    this.logger.log(`Finding store: ${id} for user: ${userId}`);

    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
              id: true,
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
        reviews: {
          where: { status: 'APPROVED' },
          select: { rating: true },
        },
      },
    });

    if (!store) {
      this.logger.warn(`Store not found: ${id}`);
      throw new NotFoundException('Store not found');
    }

    // Non-owners and non-admins can only view verified stores
    if (!store.isVerified && store.ownerId !== userId && userRole !== 'ADMIN') {
      this.logger.warn(`Unauthorized access to unverified store: ${id}`);
      throw new ForbiddenException('Store not verified');
    }

    return this.withRatingSummary(store as any);
  }

  async update(id: string, updateStoreDto: Partial<CreateStoreDto>, userId: string, userRole: string) {
    this.logger.log(`Updating store: ${id} by user: ${userId}`);

    const store = await this.prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      this.logger.warn(`Store not found: ${id}`);
      throw new NotFoundException('Store not found');
    }

    // Only owner or admin can update
    if (store.ownerId !== userId && userRole !== 'ADMIN') {
      this.logger.warn(`Unauthorized update attempt for store: ${id}`);
      throw new ForbiddenException('You can only update your own stores');
    }

    const updatedStore = await this.prisma.store.update({
      where: { id },
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

    this.logger.log(`Store updated successfully: ${id}`);
    return updatedStore;
  }

  async delete(id: string, userId: string, userRole: string) {
    this.logger.log(`Deleting store: ${id} by user: ${userId}`);

    const store = await this.prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      this.logger.warn(`Store not found: ${id}`);
      throw new NotFoundException('Store not found');
    }

    // Only owner or admin can delete
    if (store.ownerId !== userId && userRole !== 'ADMIN') {
      this.logger.warn(`Unauthorized delete attempt for store: ${id}`);
      throw new ForbiddenException('You can only delete your own stores');
    }

    // Check if store has products
    const productCount = await this.prisma.product.count({
      where: { storeId: id },
    });

    if (productCount > 0) {
      this.logger.warn(`Cannot delete store ${id} with ${productCount} products`);
      throw new ConflictException('Cannot delete store with existing products. Please delete all products first.');
    }

    await this.prisma.store.delete({
      where: { id },
    });

    this.logger.log(`Store deleted successfully: ${id}`);
  }

  async verifyStore(id: string, isVerified: boolean) {
    this.logger.log(`Verifying store: ${id}, verified: ${isVerified}`);

    const store = await this.prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      this.logger.warn(`Store not found: ${id}`);
      throw new NotFoundException('Store not found');
    }

    const updatedStore = await this.prisma.store.update({
      where: { id },
      data: { isVerified },
      include: {
        owner: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    this.logger.log(`Store verification status updated: ${id}`);
    return updatedStore;
  }

  async submitCertification(id: string, certificationUrl: string, userId: string, userRole: string) {
    const store = await this.prisma.store.findUnique({ where: { id } });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (store.ownerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only submit certification for your own farm');
    }

    return this.prisma.store.update({
      where: { id },
      data: {
        certificationUrl,
        certificationStatus: 'PENDING',
        certificationNotes: null,
        trustedBadge: false,
      },
    });
  }

  async getSellerDashboard(userId: string) {
    this.logger.log(`Getting seller dashboard for user: ${userId}`);

    const stores = await this.prisma.store.findMany({
      where: {
        ownerId: userId,
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

    // Calculate stats for each store
    const storeIds = stores.map(store => store.id);

    const productFavoriteCounts = await this.prisma.favorite.groupBy({
      by: ['productId'],
      where: {
        product: {
          storeId: { in: storeIds },
        },
      },
      _count: true,
    });

    const products = await this.prisma.product.findMany({
      where: { storeId: { in: storeIds } },
      select: { id: true, storeId: true },
    });

    const productToStore = new Map(products.map(p => [p.id, p.storeId]));
    const storeFavoritesMap = new Map<string, number>();
    for (const fc of productFavoriteCounts) {
      const sid = productToStore.get(fc.productId);
      if (sid) storeFavoritesMap.set(sid, (storeFavoritesMap.get(sid) || 0) + fc._count);
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentProductCounts = await this.prisma.product.groupBy({
      by: ['storeId'],
      where: {
        storeId: { in: storeIds },
        createdAt: { gte: sevenDaysAgo },
      },
      _count: true,
    });

    const recentProductsMap = new Map(
      recentProductCounts.map(rc => [rc.storeId, rc._count])
    );

    const storesWithStats = stores.map(store => ({
      ...store,
      stats: {
        totalProducts: store._count.products,
        totalFavorites: storeFavoritesMap.get(store.id) || 0,
        recentProducts: recentProductsMap.get(store.id) || 0,
      },
    }));

    return {
      stores: storesWithStats,
    };
  }

  async getPendingStores() {
    this.logger.log('Getting pending stores for admin');

    const stores = await this.prisma.store.findMany({
      where: {
        isVerified: false,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            phone: true,
            city: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    this.logger.log(`Found ${stores.length} pending stores`);
    return stores;
  }

  private withRatingSummary(store: any) {
    const reviews = store.reviews || [];
    const reviewCount = reviews.length;
    const averageRating = reviewCount
      ? Math.round((reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewCount) * 10) / 10
      : 0;
    const { reviews: _reviews, ...rest } = store;
    return { ...rest, reviewCount, averageRating };
  }
}
