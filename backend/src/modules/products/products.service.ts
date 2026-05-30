import { Injectable, NotFoundException, ForbiddenException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database';
import { CreateProductDto, UpdateProductDto, ProductQueryDto, PaginationQueryDto } from './dtos/product.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async findAll(query: ProductQueryDto, userId?: string) {
    this.logger.log(`Fetching products: ${JSON.stringify(query)}`);

    const {
      page = 1,
      limit = 20,
      category,
      storeId,
      search,
      minPrice,
      maxPrice,
      minRating,
      sort = 'createdAt',
      order = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    // If a specific storeId is provided, check if the requesting user owns it.
    // Store owners can see their own products even from unverified stores.
    // For general browsing (no storeId), only show products from verified stores.
    if (storeId) {
      where.storeId = storeId;
      // Check if the user is the store owner
      if (userId) {
        const store = await this.prisma.store.findUnique({
          where: { id: storeId },
          select: { ownerId: true, isVerified: true },
        });
        // Only apply verified filter if user is NOT the store owner
        if (!store || store.ownerId !== userId) {
          where.store = { isVerified: true };
        }
      } else {
        where.store = { isVerified: true };
      }
    } else {
      where.store = { isVerified: true };
    }

    if (category) {
      where.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              city: true,
              latitude: true,
              longitude: true,
              category: true,
              whatsappNumber: true,
              instagramHandle: true,
              isVerified: true,
              trustedBadge: true,
            },
          },
          _count: {
            select: { favorites: true },
          },
          reviews: {
            where: { status: 'APPROVED' },
            select: { rating: true },
          },
        },
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    let items = products.map((product: any) => this.withRatingSummary(product));

    if (minRating !== undefined) {
      items = items.filter((product: any) => product.averageRating >= minRating);
    }

    if (userId) {
      const userFavorites = await this.prisma.favorite.findMany({
        where: { userId },
        select: { productId: true },
      });

      const favoriteIds = new Set(userFavorites.map((f) => f.productId));
      items = items.map((product: any) => ({
        ...product,
        isFavorited: favoriteIds.has(product.id),
      }));
    } else {
      items = items.map((product: any) => ({ ...product, isFavorited: false }));
    }

    return {
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      message: 'Products retrieved successfully',
    };
  }

  async findOne(id: string, userId?: string) {
    this.logger.log(`Fetching product ${id}`);

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            description: true,
            category: true,
            city: true,
            latitude: true,
            longitude: true,
            whatsappNumber: true,
            instagramHandle: true,
            isVerified: true,
            trustedBadge: true,
          },
        },
        _count: {
          select: { favorites: true },
        },
        reviews: {
          where: { status: 'APPROVED' },
          select: { rating: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.store.isVerified) {
      throw new ForbiddenException('Access denied: Product from unverified store');
    }

    let isFavorited = false;
    if (userId) {
      const favorite = await this.prisma.favorite.findUnique({
        where: {
          userId_productId: { userId, productId: id },
        },
      });
      isFavorited = !!favorite;
    }

    return {
      success: true,
      data: {
        ...this.withRatingSummary(product as any),
        isFavorited,
      },
      message: 'Product retrieved successfully',
    };
  }

  async addFavorite(userId: string, productId: string) {
    this.logger.log(`Adding favorite: user=${userId}, product=${productId}`);

    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existingFavorite) {
      throw new ConflictException('Product already in favorites');
    }

    const favorite = await this.prisma.favorite.create({
      data: {
        userId,
        productId,
      },
    });

    return {
      success: true,
      data: favorite,
      message: 'Product added to favorites',
    };
  }

  async removeFavorite(userId: string, productId: string) {
    this.logger.log(`Removing favorite: user=${userId}, product=${productId}`);

    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Product not in favorites');
    }

    await this.prisma.favorite.delete({
      where: {
        userId_productId: { userId, productId },
      },
    });

    return {
      success: true,
      data: null,
      message: 'Product removed from favorites',
    };
  }

  async getUserFavorites(userId: string, query: PaginationQueryDto) {
    this.logger.log(`Fetching user favorites: ${userId}`);

    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              store: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                  city: true,
                  whatsappNumber: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);

    const items = favorites.map((favorite) => ({
      id: favorite.id,
      createdAt: favorite.createdAt,
      product: {
        ...favorite.product,
        isFavorited: true,
      },
    }));

    return {
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      message: 'Favorites retrieved successfully',
    };
  }

  async toggleFavorite(userId: string, productId: string) {
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existingFavorite) {
      return this.removeFavorite(userId, productId);
    } else {
      return this.addFavorite(userId, productId);
    }
  }

  async create(createProductDto: CreateProductDto, userId: string) {
    this.logger.log(`Creating product for user: ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
      throw new ForbiddenException('Only sellers and admins can create products');
    }

    let storeId = createProductDto.storeId;

    if (!storeId) {
      const sellerStore = await this.prisma.store.findFirst({
        where: { ownerId: userId },
      });
      if (!sellerStore) {
        throw new NotFoundException('You need to create a store first');
      }
      storeId = sellerStore.id;
    }

    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (!store.isVerified && store.ownerId !== userId) {
      throw new ForbiddenException('Cannot create products for unverified stores');
    }

    const product = await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        price: createProductDto.price,
        category: createProductDto.category,
        imageUrls: createProductDto.imageUrls || [],
        originAddressText: createProductDto.originAddressText || store.addressText,
        originCity: createProductDto.originCity || store.city,
        originLatitude: createProductDto.originLatitude ?? store.latitude,
        originLongitude: createProductDto.originLongitude ?? store.longitude,
        storeId: storeId,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            city: true,
            latitude: true,
            longitude: true,
            category: true,
            whatsappNumber: true,
            instagramHandle: true,
          },
        },
        _count: {
          select: { favorites: true },
        },
      },
    });

    this.logger.log(`Product created successfully: ${product.id}`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string, userRole: string) {
    this.logger.log(`Updating product: ${id} by user: ${userId}`);

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Only store owner or admin can update
    const store = await this.prisma.store.findUnique({
      where: { id: product.storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (store.ownerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own products');
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            category: true,
            whatsappNumber: true,
            instagramHandle: true,
          },
        },
        _count: {
          select: { favorites: true },
        },
      },
    });

    this.logger.log(`Product updated successfully: ${id}`);
    return updatedProduct;
  }

  async delete(id: string, userId: string, userRole: string) {
    this.logger.log(`Deleting product: ${id} by user: ${userId}`);

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Only store owner or admin can delete
    const store = await this.prisma.store.findUnique({
      where: { id: product.storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (store.ownerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own products');
    }

    // Delete product images
    if (product.imageUrls && product.imageUrls.length > 0) {
      this.logger.log(`Processing delete for ${product.imageUrls.length} images`);
      // Base64 images stored in DB don't need external cleanup
    }

    await this.prisma.product.delete({
      where: { id },
    });

    this.logger.log(`Product deleted successfully: ${id}`);
  }

  async uploadProductImages(base64Images: string[]) {
    this.logger.log(`Processing ${base64Images.length} product images`);

    if (base64Images.length < 1) {
      throw new ForbiddenException('At least 1 image is required');
    }

    if (base64Images.length > 5) {
      throw new ForbiddenException('Maximum 5 images allowed');
    }

    try {
      // Just return base64 images as-is (no Cloudinary upload needed)
      this.logger.log(`Successfully processed ${base64Images.length} images`);
      return base64Images;
    } catch (error) {
      this.logger.error(`Failed to process images: ${error.message}`, error.stack);
      throw new ForbiddenException('Failed to process images');
    }
  }

  private withRatingSummary(product: any) {
    const reviews = product.reviews || [];
    const reviewCount = reviews.length;
    const averageRating = reviewCount
      ? Math.round((reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewCount) * 10) / 10
      : 0;
    const { reviews: _reviews, ...rest } = product;
    return { ...rest, reviewCount, averageRating };
  }
}
