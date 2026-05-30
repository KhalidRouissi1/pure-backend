import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database';
import { CheckoutDto } from './dtos/checkout.dto';

const DEFAULT_DELIVERY_FEE = 15;
const DEFAULT_ETA_MINUTES = 45;

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async checkout(userId: string, dto: CheckoutDto) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: { include: { store: true } } },
      orderBy: { createdAt: 'asc' },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const address = dto.addressId
      ? await this.prisma.address.findFirst({ where: { id: dto.addressId, userId } })
      : await this.prisma.address.findFirst({ where: { userId, isDefault: true } });

    if (!address) {
      throw new NotFoundException('Delivery address required');
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );
    const total = subtotal + DEFAULT_DELIVERY_FEE;

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          addressId: address.id,
          subtotal,
          deliveryFee: DEFAULT_DELIVERY_FEE,
          total,
          paymentMethod: dto.paymentMethod,
          paymentStatus: dto.paymentStatus || 'CONFIRMED',
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
              const lineTotal = Number(item.product.price) * item.quantity;
              return {
                productId: item.productId,
                storeId: item.product.storeId,
                productName: item.product.name,
                storeName: item.product.store.name,
                unitPrice: item.product.price,
                quantity: item.quantity,
                lineTotal,
              };
            }),
          },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { userId } });
      return created;
    });

    return order;
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
