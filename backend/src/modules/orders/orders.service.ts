import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database';
import { Prisma } from '@prisma/client';
import { CheckoutDto } from './dtos/checkout.dto';

const DEFAULT_DELIVERY_FEE = 15;
const DEFAULT_ETA_MINUTES = 45;

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async checkout(userId: string, dto: CheckoutDto) {
    return this.prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: { product: { include: { store: true } } },
        orderBy: { createdAt: 'asc' },
      });

      if (cartItems.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      if (cartItems.some((item) =>
        !item.product.store.isVerified ||
        !item.product.isActive ||
        item.product.inventoryQuantity < item.quantity
      )) {
        throw new BadRequestException('Your cart contains a product that is no longer available');
      }

      const address = dto.addressId
        ? await tx.address.findFirst({ where: { id: dto.addressId, userId } })
        : await tx.address.findFirst({ where: { userId, isDefault: true } });

      if (!address) {
        throw new NotFoundException('Delivery address required');
      }

      const subtotalCents = cartItems.reduce(
        (sum, item) => sum + Math.round(Number(item.product.price) * 100) * item.quantity,
        0,
      );
      const deliveryFeeCents = DEFAULT_DELIVERY_FEE * 100;

      for (const item of cartItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            isActive: true,
            inventoryQuantity: { gte: item.quantity },
          },
          data: { inventoryQuantity: { decrement: item.quantity } },
        });
        if (updated.count !== 1) {
          throw new BadRequestException(`${item.product.name} is no longer available in that quantity`);
        }
      }

      const created = await tx.order.create({
        data: {
          userId,
          addressId: address.id,
          subtotal: new Prisma.Decimal(subtotalCents).div(100),
          deliveryFee: new Prisma.Decimal(deliveryFeeCents).div(100),
          total: new Prisma.Decimal(subtotalCents + deliveryFeeCents).div(100),
          paymentMethod: dto.paymentMethod,
          paymentStatus: 'PENDING',
          status: 'CONFIRMED',
          deliveryEtaMinutes: DEFAULT_ETA_MINUTES,
          deliveryAddress: {
            label: address.label,
            recipient: address.recipient,
            phone: address.phone,
            city: address.city,
            line1: address.line1,
            line2: address.line2,
            latitude: address.latitude,
            longitude: address.longitude,
          },
          items: {
            create: cartItems.map((item) => {
              const lineTotalCents = Math.round(Number(item.product.price) * 100) * item.quantity;
              return {
                productId: item.productId,
                storeId: item.product.storeId,
                productName: item.product.name,
                storeName: item.product.store.name,
                unitPrice: item.product.price,
                quantity: item.quantity,
                lineTotal: new Prisma.Decimal(lineTotalCents).div(100),
              };
            }),
          },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { userId } });
      return created;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string, role?: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true, user: true } });
    if (!order || (role !== 'ADMIN' && order.userId !== userId)) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findAllForAdmin() {
    return this.prisma.order.findMany({
      include: { items: true, user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
