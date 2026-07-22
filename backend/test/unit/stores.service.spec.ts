import { StoresService } from '../../src/modules/stores/stores.service';

describe('StoresService', () => {
  const tx = {
    store: { update: jest.fn(), count: jest.fn() },
    user: { update: jest.fn() },
  };
  const prisma = {
    store: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    user: { update: jest.fn() },
    $transaction: jest.fn((callback) => callback(tx)),
  } as any;
  const service = new StoresService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.store.findMany.mockResolvedValue([]);
    prisma.store.count.mockResolvedValue(0);
  });

  it('shows only verified stores to guests', async () => {
    await service.findAll(undefined, undefined, {});
    expect(prisma.store.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isVerified: true } }),
    );
  });

  it('lets signed-in users see verified stores and their own application', async () => {
    await service.findAll('user-id', 'USER', {});
    expect(prisma.store.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ isVerified: true }, { ownerId: 'user-id' }] },
      }),
    );
  });

  it('promotes an approved store owner to seller in the same transaction', async () => {
    prisma.store.findUnique.mockResolvedValue({ id: 'store-id' });
    tx.store.update.mockResolvedValue({
      id: 'store-id',
      ownerId: 'user-id',
      owner: { id: 'user-id', role: 'USER' },
    });

    await service.verifyStore('store-id', true);

    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: { role: 'SELLER' },
    });
  });
});
