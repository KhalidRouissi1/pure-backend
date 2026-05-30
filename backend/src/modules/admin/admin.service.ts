import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database';

export interface AdminDashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalStores: number;
  verifiedStores: number;
  pendingStores: number;
  totalProducts: number;
  totalOrders: number;
  totalOrdersPending: number;
  totalOrdersConfirmed: number;
  totalOrdersPreparing: number;
  totalOrdersOutForDelivery: number;
  totalOrdersDelivered: number;
  totalOrdersCancelled: number;
  totalGmv: number;
  avgOrderValue: number;
  totalDeliveryFees: number;
  pendingReviews: number;
  pendingCertifications: number;
  trustedBadgeCount: number;
  newUsers7d: number;
  newStores7d: number;
  newProducts7d: number;
  newOrders7d: number;
  newUsers30d: number;
  avgProductsPerStore: number;
}

export interface CategoryStats {
  category: string;
  count: number;
}

export interface RegionStats {
  region: string;
  count: number;
}

export interface RecentActivity {
  stores: any[];
  products: any[];
  orders: any[];
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  async getPendingStores() {
    this.logger.log('Fetching pending stores for admin');

    const stores = await this.prisma.store.findMany({
      where: { isVerified: false },
      include: {
        owner: {
          select: { id: true, email: true, city: true, phone: true },
        },
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    this.logger.log(`Found ${stores.length} pending stores`);
    return stores;
  }

  async verifyStore(storeId: string, isVerified: boolean) {
    this.logger.log(`Verifying store: ${storeId}, verified: ${isVerified}`);

    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      this.logger.warn(`Store not found: ${storeId}`);
      throw new NotFoundException('Store not found');
    }

    const updatedStore = await this.prisma.store.update({
      where: { id: storeId },
      data: { isVerified },
      include: {
        owner: true,
        _count: { select: { products: true } },
      },
    });

    this.logger.log(`Store verification status updated: ${storeId}`);
    return updatedStore;
  }

  async reviewCertification(storeId: string, status: 'APPROVED' | 'REJECTED', notes?: string) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return this.prisma.store.update({
      where: { id: storeId },
      data: {
        certificationStatus: status,
        certificationNotes: notes,
        trustedBadge: status === 'APPROVED',
        isVerified: status === 'APPROVED' ? true : store.isVerified,
      },
      include: {
        owner: true,
        _count: { select: { products: true } },
      },
    });
  }

  private async getGrowthCounts(days: number) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);

    const [newUsers, newStores, newProducts, newOrders] = await Promise.all([
      this.prisma.user.count({ where: { createdAt: { gte: threshold } } }),
      this.prisma.store.count({ where: { createdAt: { gte: threshold } } }),
      this.prisma.product.count({ where: { createdAt: { gte: threshold } } }),
      this.prisma.order.count({ where: { createdAt: { gte: threshold } } }),
    ]);

    return { newUsers, newStores, newProducts, newOrders };
  }

  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    this.logger.log('Fetching admin dashboard stats');

    const now = new Date();

    const [
      totalUsers,
      totalSellers,
      totalStores,
      verifiedStores,
      pendingStores,
      totalProducts,
      totalOrders,
      orderStatusCounts,
      orderAggregates,
      pendingReviews,
      pendingCertifications,
      trustedBadgeCount,
      growth7d,
      growth30d,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'SELLER' } }),
      this.prisma.store.count(),
      this.prisma.store.count({ where: { isVerified: true } }),
      this.prisma.store.count({ where: { isVerified: false } }),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.order.aggregate({
        _sum: { total: true, deliveryFee: true },
        _avg: { total: true },
      }),
      this.prisma.review.count({ where: { status: 'PENDING' } }),
      this.prisma.store.count({
        where: { certificationStatus: 'PENDING', certificationUrl: { not: null } },
      }),
      this.prisma.store.count({ where: { trustedBadge: true } }),
      this.getGrowthCounts(7),
      this.getGrowthCounts(30),
    ]);

    const statusMap: Record<string, number> = {};
    for (const row of orderStatusCounts) {
      statusMap[row.status] = row._count;
    }

    const totalGmv = Number(orderAggregates._sum.total || 0);
    const avgOrderValue = Number(orderAggregates._avg.total || 0);
    const totalDeliveryFees = Number(orderAggregates._sum.deliveryFee || 0);
    const avgProductsPerStore = totalStores > 0 ? Math.round((totalProducts / totalStores) * 10) / 10 : 0;

    this.logger.log('Dashboard stats retrieved successfully');

    return {
      totalUsers,
      totalSellers,
      totalStores,
      verifiedStores,
      pendingStores,
      totalProducts,
      totalOrders,
      totalOrdersPending: statusMap['PENDING'] || 0,
      totalOrdersConfirmed: statusMap['CONFIRMED'] || 0,
      totalOrdersPreparing: statusMap['PREPARING'] || 0,
      totalOrdersOutForDelivery: statusMap['OUT_FOR_DELIVERY'] || 0,
      totalOrdersDelivered: statusMap['DELIVERED'] || 0,
      totalOrdersCancelled: statusMap['CANCELLED'] || 0,
      totalGmv,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      totalDeliveryFees,
      pendingReviews,
      pendingCertifications,
      trustedBadgeCount,
      newUsers7d: growth7d.newUsers,
      newStores7d: growth7d.newStores,
      newProducts7d: growth7d.newProducts,
      newOrders7d: growth7d.newOrders,
      newUsers30d: growth30d.newUsers,
      avgProductsPerStore,
    };
  }

  async getStoresByCategory(): Promise<CategoryStats[]> {
    this.logger.log('Fetching stores grouped by category');

    const categoryStats = await this.prisma.store.groupBy({
      by: ['category'],
      _count: true,
    });

    return categoryStats.map(stat => ({
      category: stat.category,
      count: stat._count,
    }));
  }

  async getStoresByRegion(): Promise<RegionStats[]> {
    this.logger.log('Fetching stores grouped by region');

    const storeData = await this.prisma.store.findMany({
      include: {
        owner: { select: { city: true } },
      },
    });

    const regionMap = new Map<string, number>();
    storeData.forEach(store => {
      const city = store.city || store.owner.city || 'Other';
      regionMap.set(city, (regionMap.get(city) || 0) + 1);
    });

    return Array.from(regionMap.entries())
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getRecentStores(limit: number = 10) {
    this.logger.log(`Fetching recent stores, limit: ${limit}`);

    return this.prisma.store.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, email: true, city: true } },
        _count: { select: { products: true } },
      },
    });
  }

  async getRecentProducts(limit: number = 10) {
    this.logger.log(`Fetching recent products, limit: ${limit}`);

    return this.prisma.product.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        store: {
          select: { id: true, name: true, owner: { select: { email: true } } },
        },
      },
    });
  }

  async getUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      items: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateUserRole(userId: string, role: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  async getAllStores(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, email: true, name: true } },
        },
      }),
      this.prisma.store.count(),
    ]);

    return {
      items: stores,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async deleteStore(storeId: string) {
    return this.prisma.store.delete({ where: { id: storeId } });
  }
}
