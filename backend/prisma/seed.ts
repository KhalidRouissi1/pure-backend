import { Category, OrderStatus, PaymentStatus, PrismaClient, ReviewStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEMO_PASSWORDS = {
  admin: 'Admin123!',
  seller: 'Seller123!',
  user: 'User123!',
};

const sellerProfiles = [
  { email: 'seller@watani.local', name: 'Noura AlHarbi', city: 'Riyadh', phone: '0509876543' },
  { email: 'seller.honey@watani.local', name: 'Fahad AlQahtani', city: 'Al Baha', phone: '0551203344' },
  { email: 'seller.dates@watani.local', name: 'Maha AlOtaibi', city: 'Al Qassim', phone: '0537719921' },
  { email: 'seller.herbs@watani.local', name: 'Salem AlZahrani', city: 'Taif', phone: '0548824410' },
];

const buyerProfiles = [
  { email: 'user@watani.local', name: 'Test User', city: 'Riyadh', phone: '0501112233' },
  { email: 'buyer.jeddah@watani.local', name: 'Layla Hassan', city: 'Jeddah', phone: '0563321100' },
  { email: 'buyer.dammam@watani.local', name: 'Omar Saleh', city: 'Dammam', phone: '0589012234' },
];

const storeSeeds = [
  {
    ownerEmail: 'seller@watani.local',
    name: 'Riyadh Organic Farms',
    description: 'Seasonal vegetables and fruits grown around Riyadh with transparent sourcing.',
    category: Category.FRUITS_VEGETABLES,
    city: 'Riyadh',
    addressText: 'Al Ammariyah Road, Riyadh',
    latitude: 24.7136,
    longitude: 46.6753,
    whatsappNumber: '966509876543',
    instagramHandle: 'riyadh_organic',
    isVerified: true,
    certificationStatus: 'APPROVED' as const,
    trustedBadge: true,
    products: [
      { name: 'Najdi Tomatoes Basket', description: 'Fresh red tomatoes picked this morning.', price: 22, category: Category.FRUITS_VEGETABLES, imageUrls: ['https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=900'], originCity: 'Riyadh' },
      { name: 'Local Cucumber Box', description: 'Crunchy cucumbers for salads and daily cooking.', price: 18, category: Category.FRUITS_VEGETABLES, imageUrls: ['https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=900'], originCity: 'Riyadh' },
      { name: 'Seasonal Mixed Greens', description: 'A weekly mix of leafy greens from Saudi farms.', price: 26, category: Category.FRUITS_VEGETABLES, imageUrls: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900'], originCity: 'Riyadh' },
    ],
  },
  {
    ownerEmail: 'seller.honey@watani.local',
    name: 'Al Baha Mountain Honey',
    description: 'Raw sidr and wildflower honey from mountain beekeepers.',
    category: Category.HONEY,
    city: 'Al Baha',
    addressText: 'Al Mandaq, Al Baha',
    latitude: 20.0129,
    longitude: 41.4677,
    whatsappNumber: '966551203344',
    instagramHandle: 'albaha_honey',
    isVerified: true,
    certificationStatus: 'APPROVED' as const,
    trustedBadge: true,
    products: [
      { name: 'Raw Sidr Honey 500g', description: 'Rich sidr honey with deep mountain aroma.', price: 145, category: Category.HONEY, imageUrls: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=900'], originCity: 'Al Baha' },
      { name: 'Wildflower Honey 250g', description: 'Light floral honey from seasonal wildflowers.', price: 68, category: Category.HONEY, imageUrls: ['https://images.unsplash.com/photo-1471943311424-646960669fbc?w=900'], originCity: 'Al Baha' },
      { name: 'Honey Gift Set', description: 'Three mini jars for gifting and tasting.', price: 120, category: Category.HONEY, imageUrls: ['https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=900'], originCity: 'Al Baha' },
    ],
  },
  {
    ownerEmail: 'seller.dates@watani.local',
    name: 'Qassim Date House',
    description: 'Premium dates and date-based pantry products from Al Qassim.',
    category: Category.DAIRY,
    city: 'Al Qassim',
    addressText: 'Buraydah Date Market, Al Qassim',
    latitude: 26.3592,
    longitude: 43.9818,
    whatsappNumber: '966537719921',
    instagramHandle: 'qassim_dates',
    isVerified: true,
    certificationStatus: 'APPROVED' as const,
    trustedBadge: false,
    products: [
      { name: 'Sukkari Dates 1kg', description: 'Soft premium sukkari dates in family pack.', price: 55, category: Category.DAIRY, imageUrls: ['https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=900'], originCity: 'Al Qassim' },
      { name: 'Date Molasses 400g', description: 'Natural date syrup for breakfast and desserts.', price: 32, category: Category.DAIRY, imageUrls: ['https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=900'], originCity: 'Al Qassim' },
    ],
  },
  {
    ownerEmail: 'seller.herbs@watani.local',
    name: 'Taif Herbal Garden',
    description: 'Saudi-grown herbs, rose blends, and wellness pantry products.',
    category: Category.HERBS,
    city: 'Taif',
    addressText: 'Al Hada Road, Taif',
    latitude: 21.4373,
    longitude: 40.5127,
    whatsappNumber: '966548824410',
    instagramHandle: 'taif_herbs',
    isVerified: false,
    certificationStatus: 'PENDING' as const,
    trustedBadge: false,
    products: [
      { name: 'Dried Mint Bundle', description: 'Naturally dried mint for tea and cooking.', price: 24, category: Category.HERBS, imageUrls: ['https://images.unsplash.com/photo-1628557044797-f21a177c37ec?w=900'], originCity: 'Taif' },
      { name: 'Taif Rose Tea Blend', description: 'Aromatic rose and herbal blend.', price: 44, category: Category.HERBS, imageUrls: ['https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=900'], originCity: 'Taif' },
    ],
  },
  {
    ownerEmail: 'seller@watani.local',
    name: 'Hijaz Natural Beauty',
    description: 'Small-batch soaps and natural care products inspired by Saudi botanicals.',
    category: Category.NATURAL_BEAUTY,
    city: 'Jeddah',
    addressText: 'Al Rawdah, Jeddah',
    latitude: 21.5433,
    longitude: 39.1728,
    whatsappNumber: '966509876543',
    instagramHandle: 'hijaz_beauty',
    isVerified: false,
    certificationStatus: 'PENDING' as const,
    trustedBadge: false,
    products: [
      { name: 'Olive Oil Soap Bar', description: 'Gentle handmade soap with olive oil.', price: 29, category: Category.NATURAL_BEAUTY, imageUrls: ['https://images.unsplash.com/photo-1607006483224-9b95a31b519b?w=900'], originCity: 'Jeddah' },
      { name: 'Rose Water Mist', description: 'Refreshing face mist with Taif rose notes.', price: 39, category: Category.NATURAL_BEAUTY, imageUrls: ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=900'], originCity: 'Jeddah' },
    ],
  },
];

const demoEmails = [
  'admin@watani.local',
  ...sellerProfiles.map((seller) => seller.email),
  ...buyerProfiles.map((buyer) => buyer.email),
];

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function createUser(email: string, password: string, role: Role, name: string, city: string, phone?: string) {
  return prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 10),
      name,
      role,
      city,
      phone,
      createdAt: daysAgo(Math.floor(Math.random() * 28) + 1),
    },
  });
}

async function main() {
  const existingDemoUsers = await prisma.user.findMany({
    where: { email: { in: demoEmails } },
    select: { id: true },
  });
  const demoUserIds = existingDemoUsers.map((user) => user.id);
  const existingDemoStores = await prisma.store.findMany({
    where: {
      OR: [
        { ownerId: { in: demoUserIds } },
        { name: { in: storeSeeds.map((store) => store.name) } },
      ],
    },
    select: { id: true },
  });
  const demoStoreIds = existingDemoStores.map((store) => store.id);
  const existingDemoProducts = await prisma.product.findMany({
    where: { storeId: { in: demoStoreIds } },
    select: { id: true },
  });
  const demoProductIds = existingDemoProducts.map((product) => product.id);
  const existingDemoOrders = await prisma.order.findMany({
    where: { userId: { in: demoUserIds } },
    select: { id: true },
  });
  const demoOrderIds = existingDemoOrders.map((order) => order.id);

  await prisma.cartItem.deleteMany({
    where: { OR: [{ userId: { in: demoUserIds } }, { productId: { in: demoProductIds } }] },
  });
  await prisma.favorite.deleteMany({
    where: { OR: [{ userId: { in: demoUserIds } }, { productId: { in: demoProductIds } }] },
  });
  await prisma.review.deleteMany({
    where: {
      OR: [
        { userId: { in: demoUserIds } },
        { productId: { in: demoProductIds } },
        { storeId: { in: demoStoreIds } },
      ],
    },
  });
  await prisma.orderItem.deleteMany({ where: { orderId: { in: demoOrderIds } } });
  await prisma.order.deleteMany({ where: { id: { in: demoOrderIds } } });
  await prisma.product.deleteMany({ where: { id: { in: demoProductIds } } });
  await prisma.store.deleteMany({ where: { id: { in: demoStoreIds } } });
  await prisma.address.deleteMany({ where: { userId: { in: demoUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: demoUserIds } } });

  const admin = await createUser('admin@watani.local', DEMO_PASSWORDS.admin, Role.ADMIN, 'Admin User', 'Riyadh', '0501234567');
  const sellers = await Promise.all(
    sellerProfiles.map((seller) => createUser(seller.email, DEMO_PASSWORDS.seller, Role.SELLER, seller.name, seller.city, seller.phone)),
  );
  const buyers = await Promise.all(
    buyerProfiles.map((buyer) => createUser(buyer.email, DEMO_PASSWORDS.user, Role.USER, buyer.name, buyer.city, buyer.phone)),
  );

  const sellersByEmail = new Map(sellers.map((seller) => [seller.email, seller]));
  const allProducts = [];
  const stores = [];

  for (const seed of storeSeeds) {
    const owner = sellersByEmail.get(seed.ownerEmail);
    if (!owner) throw new Error(`Missing seller for ${seed.ownerEmail}`);

    const store = await prisma.store.create({
      data: {
        name: seed.name,
        description: seed.description,
        category: seed.category,
        city: seed.city,
        addressText: seed.addressText,
        latitude: seed.latitude,
        longitude: seed.longitude,
        whatsappNumber: seed.whatsappNumber,
        instagramHandle: seed.instagramHandle,
        isVerified: seed.isVerified,
        certificationStatus: seed.certificationStatus,
        certificationUrl: seed.certificationStatus === 'PENDING' ? 'https://example.com/demo-certification.pdf' : 'https://example.com/approved-certification.pdf',
        certificationNotes: seed.certificationStatus === 'APPROVED' ? 'Verified demo certification.' : null,
        trustedBadge: seed.trustedBadge,
        ownerId: owner.id,
        createdAt: daysAgo(Math.floor(Math.random() * 20) + 1),
      },
    });
    stores.push(store);

    for (const productSeed of seed.products) {
      const product = await prisma.product.create({
        data: {
          name: productSeed.name,
          description: productSeed.description,
          price: productSeed.price,
          category: productSeed.category,
          imageUrls: productSeed.imageUrls,
          originCity: productSeed.originCity,
          originAddressText: seed.addressText,
          originLatitude: seed.latitude,
          originLongitude: seed.longitude,
          storeId: store.id,
          createdAt: daysAgo(Math.floor(Math.random() * 12)),
        },
      });
      allProducts.push({ ...product, store });
    }
  }

  for (const buyer of buyers) {
    await prisma.address.create({
      data: {
        userId: buyer.id,
        label: 'Home',
        recipient: buyer.name || 'Demo Buyer',
        phone: buyer.phone || '0500000000',
        city: buyer.city || 'Riyadh',
        addressText: `${buyer.city || 'Riyadh'} demo delivery address`,
        line1: 'Demo district, Street 12',
        line2: 'Building 4',
        isDefault: true,
      },
    });
  }

  const verifiedProducts = allProducts.filter((item) => item.store.isVerified);
  for (let i = 0; i < verifiedProducts.length; i++) {
    const buyer = buyers[i % buyers.length];
    await prisma.favorite.create({ data: { userId: buyer.id, productId: verifiedProducts[i].id, createdAt: daysAgo(i % 8) } });
    if (i % 2 === 0) {
      await prisma.favorite.create({ data: { userId: buyers[(i + 1) % buyers.length].id, productId: verifiedProducts[i].id, createdAt: daysAgo((i + 2) % 8) } });
    }
  }

  const reviewTargets = verifiedProducts.slice(0, 8);
  for (let i = 0; i < reviewTargets.length; i++) {
    await prisma.review.create({
      data: {
        userId: buyers[i % buyers.length].id,
        productId: reviewTargets[i].id,
        rating: 4 + (i % 2),
        comment: i % 2 === 0 ? 'Great quality and quick response from the seller.' : 'Fresh product, exactly as described.',
        status: ReviewStatus.APPROVED,
        createdAt: daysAgo(i + 1),
      },
    });
  }
  await prisma.review.create({
    data: {
      userId: buyers[0].id,
      storeId: stores[0].id,
      rating: 3,
      comment: 'Pending demo review for admin moderation.',
      status: ReviewStatus.PENDING,
      createdAt: daysAgo(1),
    },
  });

  const orderStatuses: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.DELIVERED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ];

  for (let i = 0; i < orderStatuses.length; i++) {
    const buyer = buyers[i % buyers.length];
    const address = await prisma.address.findFirstOrThrow({ where: { userId: buyer.id, isDefault: true } });
    const first = verifiedProducts[i % verifiedProducts.length];
    const second = verifiedProducts[(i + 2) % verifiedProducts.length];
    const firstQty = (i % 2) + 1;
    const secondQty = 1;
    const subtotal = Number(first.price) * firstQty + Number(second.price) * secondQty;
    const deliveryFee = 15;
    const total = subtotal + deliveryFee;

    await prisma.order.create({
      data: {
        userId: buyer.id,
        addressId: address.id,
        subtotal,
        deliveryFee,
        total,
        paymentMethod: i % 2 === 0 ? 'cash_on_delivery' : 'stc_pay',
        paymentStatus: i === 0 ? PaymentStatus.PENDING : PaymentStatus.CONFIRMED,
        status: orderStatuses[i],
        deliveryEtaMinutes: 35 + i * 5,
        deliveryAddress: {
          label: address.label,
          recipient: address.recipient,
          phone: address.phone,
          city: address.city,
          line1: address.line1,
          line2: address.line2,
        },
        createdAt: daysAgo(i),
        items: {
          create: [
            {
              productId: first.id,
              storeId: first.storeId,
              productName: first.name,
              storeName: first.store.name,
              unitPrice: first.price,
              quantity: firstQty,
              lineTotal: Number(first.price) * firstQty,
            },
            {
              productId: second.id,
              storeId: second.storeId,
              productName: second.name,
              storeName: second.store.name,
              unitPrice: second.price,
              quantity: secondQty,
              lineTotal: Number(second.price) * secondQty,
            },
          ],
        },
      },
    });
  }

  await prisma.cartItem.create({
    data: {
      userId: buyers[0].id,
      productId: verifiedProducts[0].id,
      quantity: 2,
    },
  });

  console.log('Demo seed complete');
  console.log(`Admin: ${admin.email} / ${DEMO_PASSWORDS.admin}`);
  console.log(`Seller: seller@watani.local / ${DEMO_PASSWORDS.seller}`);
  console.log(`Buyer: user@watani.local / ${DEMO_PASSWORDS.user}`);
  console.log(`Stores: ${stores.length}, Products: ${allProducts.length}, Orders: ${orderStatuses.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
