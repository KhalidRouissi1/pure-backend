import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database';
import { AddCartItemDto, UpdateCartItemDto } from './dtos/cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            store: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                trustedBadge: true,
                isVerified: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    return {
      items,
      subtotal,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: dto.productId,
        isActive: true,
        inventoryQuantity: { gte: dto.quantity },
        store: { isVerified: true },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.cartItem.findUnique({
        where: { userId_productId: { userId, productId: dto.productId } },
      });
      const nextQuantity = (existing?.quantity ?? 0) + dto.quantity;

      if (nextQuantity > 99) {
        throw new BadRequestException('Maximum quantity per product is 99');
      }
      if (nextQuantity > product.inventoryQuantity) {
        throw new BadRequestException('Requested quantity is not available');
      }

      await tx.cartItem.upsert({
        where: { userId_productId: { userId, productId: dto.productId } },
        update: { quantity: nextQuantity },
        create: { userId, productId: dto.productId, quantity: dto.quantity },
      });
    });

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findFirst({ where: { id: itemId, userId } });
    if (!item) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({ where: { id: itemId, userId } });
    if (!item) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return this.getCart(userId);
  }
}
