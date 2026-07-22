import { DiscoveryService } from '../../src/modules/discovery/discovery.service';

describe('DiscoveryService', () => {
  const prisma = {
    product: { findMany: jest.fn() },
    favorite: { findMany: jest.fn() },
  } as any;
  const service = new DiscoveryService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.product.findMany.mockResolvedValue([]);
  });

  it('always filters category discovery to verified stores', async () => {
    const result = await service.getDiscoveryFeed({ groupBy: 'category', limit: 10 });

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { store: { isVerified: true } } }),
    );
    expect(result.data.groups).toEqual([]);
  });

  it('always filters region discovery to verified stores', async () => {
    await service.getDiscoveryFeed({ groupBy: 'region', limit: 10 });
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { store: { isVerified: true } } }),
    );
  });

  it('uses an allow-listed trending period supplied by the validated controller', async () => {
    const result = await service.getTrendingProducts('7d', 20);
    expect(result.data.trending).toEqual([]);
    expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 20 }));
  });
});
