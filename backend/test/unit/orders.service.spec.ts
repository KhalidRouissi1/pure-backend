import { OrdersService } from '../../src/modules/orders/orders.service';
import { PaymentMethod } from '../../src/modules/orders/dtos/checkout.dto';

describe('OrdersService', () => {
  const tx = {
    cartItem: { findMany: jest.fn(), deleteMany: jest.fn() },
    product: { updateMany: jest.fn() },
    address: { findFirst: jest.fn() },
    order: { create: jest.fn() },
  };
  const prisma = { $transaction: jest.fn((callback) => callback(tx)) } as any;
  const service = new OrdersService(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('calculates totals from server prices and always starts payment as pending', async () => {
    tx.cartItem.findMany.mockResolvedValue([
      {
        productId: 'product-id',
        quantity: 2,
        product: {
          name: 'Honey', isActive: true, inventoryQuantity: 5,
          price: '12.50',
          storeId: 'store-id',
          store: { id: 'store-id', name: 'Farm', isVerified: true },
        },
      },
    ]);
    tx.address.findFirst.mockResolvedValue({
      id: 'address-id', label: 'Home', recipient: 'Buyer', phone: '966500000000', city: 'Riyadh', line1: 'Street',
    });
    tx.order.create.mockImplementation(({ data }) => ({ id: 'order-id', ...data }));
    tx.product.updateMany.mockResolvedValue({ count: 1 });

    const order = await service.checkout('user-id', {
      addressId: 'address-id',
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
    });

    expect(order.paymentStatus).toBe('PENDING');
    expect(order.subtotal.toString()).toBe('25');
    expect(order.total.toString()).toBe('40');
    expect(tx.cartItem.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-id' } });
  });
});
