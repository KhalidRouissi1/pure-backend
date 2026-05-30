import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database';
import { DiscoveryQueryDto } from './dtos/discovery-query.dto';

@Injectable()
export class DiscoveryService {
  private readonly logger = new Logger(DiscoveryService.name);

  constructor(private prisma: PrismaService) {}

  async getDiscoveryFeed(query: DiscoveryQueryDto, userId?: string) {
    this.logger.log(`Fetching discovery feed: groupBy=${query.groupBy}, limit=${query.limit}`);

    if (query.groupBy === 'category') {
      return this.groupByCategory(query, userId);
    } else if (query.groupBy === 'region') {
      return this.groupByRegion(query, userId);
    }

    throw new Error('Invalid groupBy parameter');
  }

  async groupByCategory(query: DiscoveryQueryDto, userId?: string) {
    const products = await this.prisma.product.findMany({
      where: {
        store: {
          isVerified: query.verified ?? true,
        },
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            category: true,
            whatsappNumber: true,
              instagramHandle: true,
              trustedBadge: true,
            },
          },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: query.limit,
    });

    let productsWithFavorites = products;
    if (userId) {
      const favorites = await this.prisma.favorite.findMany({ where: { userId }, select: { productId: true } });
      const favoriteIds = new Set(favorites.map(f => f.productId));
      productsWithFavorites = products.map((p: any) => ({ ...p, isFavorited: favoriteIds.has(p.id) })) as any;
    }

    const groups = this.groupProductsByField(productsWithFavorites, 'category');

    return {
      success: true,
      data: {
        groups: groups.map((group: any) => ({
          groupName: group.name,
          groupLabel: this.getCategoryLabel(group.name),
          totalProducts: group.count,
          products: group.items,
        })),
        metadata: {
          totalGroups: groups.length,
          totalProducts: products.length,
          groupBy: 'category',
        },
      },
      message: 'Discovery feed retrieved successfully',
    };
  }

  async groupByRegion(query: DiscoveryQueryDto, userId?: string) {
    const products = await this.prisma.product.findMany({
      where: {
        store: {
          isVerified: query.verified ?? true,
        },
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            owner: {
              select: {
                city: true,
              },
            },
            city: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: query.limit,
    });

    let productsWithFavorites = products;
    if (userId) {
      const favorites = await this.prisma.favorite.findMany({ where: { userId }, select: { productId: true } });
      const favoriteIds = new Set(favorites.map(f => f.productId));
      productsWithFavorites = products.map((p: any) => ({ ...p, isFavorited: favoriteIds.has(p.id) })) as any;
    }

    const groups = this.groupProductsByRegion(productsWithFavorites);

    return {
      success: true,
      data: {
        groups: groups.map((group: any) => ({
          groupName: group.name,
          groupLabel: this.getRegionLabel(group.name),
          totalProducts: group.count,
          products: group.items,
        })),
        metadata: {
          totalGroups: groups.length,
          totalProducts: products.length,
          groupBy: 'region',
        },
      },
      message: 'Discovery feed retrieved successfully',
    };
  }

  async getTrendingProducts(period: string = '7d', limit: number = 20, userId?: string) {
    this.logger.log(`Fetching trending products: period=${period}, limit=${limit}`);

    const days = parseInt(period.replace('d', ''), 10);
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const products = await this.prisma.product.findMany({
      where: {
        store: { isVerified: true },
        favorites: {
          some: {
            createdAt: { gte: dateThreshold },
          },
        },
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            category: true,
            whatsappNumber: true,
              instagramHandle: true,
              trustedBadge: true,
            },
          },
        _count: {
          select: { favorites: true },
        },
      },
      orderBy: {
        favorites: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    let favoriteIds = new Set<string>();
    if (userId) {
      const favorites = await this.prisma.favorite.findMany({ where: { userId }, select: { productId: true } });
      favoriteIds = new Set(favorites.map(f => f.productId));
    }

    return {
      success: true,
      data: {
        trending: products.map((product) => ({
          ...product,
          isFavorited: favoriteIds.has(product.id),
          metrics: {
            favoritesCount: product._count.favorites,
            trendingScore: product._count.favorites * 2,
            rank: 0,
          },
        })),
        metadata: {
          period,
          totalTrending: products.length,
          generatedAt: new Date().toISOString(),
        },
      },
      message: 'Trending products retrieved successfully',
    };
  }

  async getNewProducts(days: number = 7, limit: number = 20, userId?: string) {
    this.logger.log(`Fetching new products: days=${days}, limit=${limit}`);

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const products = await this.prisma.product.findMany({
      where: {
        store: { isVerified: true },
        createdAt: { gte: dateThreshold },
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            category: true,
              whatsappNumber: true,
              trustedBadge: true,
            },
          },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    let favoriteIds = new Set<string>();
    if (userId) {
      const favorites = await this.prisma.favorite.findMany({ where: { userId }, select: { productId: true } });
      favoriteIds = new Set(favorites.map(f => f.productId));
    }

    return {
      success: true,
      data: {
        newProducts: products.map((product) => ({
          ...product,
          isFavorited: favoriteIds.has(product.id),
          daysOld: Math.floor(
            (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24),
          ),
        })),
        metadata: {
          period: `Last ${days} days`,
          totalNew: products.length,
        },
      },
      message: 'New products retrieved successfully',
    };
  }

  async getCategories() {
    this.logger.log('Fetching categories');

    const categories = [
      { name: 'FRUITS_VEGETABLES', label: 'Fruits & Vegetables', labelAr: 'الفواكه والخضروات', icon: 'leaf' },
      { name: 'HONEY', label: 'Honey', labelAr: 'العسل', icon: 'nutrition' },
      { name: 'DAIRY', label: 'Dairy Products', labelAr: 'منتجات الألبان', icon: 'water' },
      { name: 'HERBS', label: 'Herbs', labelAr: 'الأعشاب', icon: 'flower' },
      { name: 'NATURAL_BEAUTY', label: 'Natural Beauty Products', labelAr: 'منتجات الجمال الطبيعية', icon: 'sparkles' },
    ];

    const categoryCounts = await Promise.all(
      categories.map(async (cat) => ({
        ...cat,
        productCount: await this.prisma.product.count({
          where: { category: cat.name as any },
        }),
        storeCount: await this.prisma.store.count({
          where: { category: cat.name as any },
        }),
      })),
    );

    return {
      success: true,
      data: {
        categories: categoryCounts,
        metadata: {
          totalCategories: categories.length,
          totalProducts: categoryCounts.reduce((sum, cat) => sum + cat.productCount, 0),
          totalStores: categoryCounts.reduce((sum, cat) => sum + cat.storeCount, 0),
        },
      },
      message: 'Categories retrieved successfully',
    };
  }

  private groupProductsByField(products: any[], field: string) {
    const groups = products.reduce((acc, product) => {
      const key = product[field];
      if (!acc[key]) {
        acc[key] = { name: key, items: [], count: 0 };
      }
      acc[key].items.push(product);
      acc[key].count++;
      return acc;
    }, {} as Record<string, { name: string; items: any[]; count: number }>);

    return Object.values(groups);
  }

  private groupProductsByRegion(products: any[]) {
    const groups = products.reduce((acc, product) => {
      const city = product.store?.city || product.store?.owner?.city || 'Other';
      if (!acc[city]) {
        acc[city] = { name: city, items: [], count: 0 };
      }
      acc[city].items.push(product);
      acc[city].count++;
      return acc;
    }, {} as Record<string, { name: string; items: any[]; count: number }>);

    return Object.values(groups);
  }

  private getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      FRUITS_VEGETABLES: 'Fruits & Vegetables',
      HONEY: 'Honey',
      DAIRY: 'Dairy Products',
      HERBS: 'Herbs',
      NATURAL_BEAUTY: 'Natural Beauty Products',
    };
    return labels[category] || category;
  }

  private getRegionLabel(region: string): string {
    const labels: Record<string, string> = {
      Riyadh: 'الرياض',
      Jeddah: 'جدة',
      Makkah: 'مكة',
      Madinah: 'المدينة',
      Dammam: 'الدمام',
      Khobar: 'الخبر',
      Tabuk: 'تبوك',
      Abha: 'أبها',
      Other: 'أخرى',
    };
    return labels[region] || region;
  }
}
