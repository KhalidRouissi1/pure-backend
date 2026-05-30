import { Injectable, NotFoundException } from '@nestjs/common';
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
      where: { id: dto.productId, store: { isVerified: true } },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId: dto.productId } },
      update: { quantity: { increment: dto.quantity } },
      create: { userId, productId: dto.productId, quantity: dto.quantity },
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
