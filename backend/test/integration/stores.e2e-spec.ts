import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/config/database';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('Stores E2E (POST /api/stores)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let sellerToken: string;
  let sellerId: string;
  let adminToken: string;

  const sellerUser = {
    email: 'seller.e2e@test.com',
    password: 'Seller123!',
    role: 'SELLER',
    city: 'Riyadh',
    phone: '0501234567',
  };

  const adminUser = {
    email: 'admin.e2e@test.com',
    password: 'Admin123!',
    role: 'ADMIN',
  };

  const validStoreData = {
    name: 'Test E2E Store',
    description: 'A test store for E2E testing',
    category: 'FOOD',
    whatsappNumber: '966509876543',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    // Clean up test data
    await prisma.store.deleteMany({
      where: {
        name: {
          contains: 'Test E2E',
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [sellerUser.email, adminUser.email],
        },
      },
    });

    // Create test users
    const hashedPassword = await bcrypt.hash(sellerUser.password, 10);
    const seller = await prisma.user.create({
      data: {
        email: sellerUser.email,
        password: hashedPassword,
        role: sellerUser.role,
        city: sellerUser.city,
        phone: sellerUser.phone,
      },
    });
    sellerId = seller.id;

    const adminHashedPassword = await bcrypt.hash(adminUser.password, 10);
    await prisma.user.create({
      data: {
        email: adminUser.email,
        password: adminHashedPassword,
        role: adminUser.role,
      },
    });

    // Generate JWT tokens
    sellerToken = jwtService.sign({
      sub: seller.id,
      email: seller.email,
      role: seller.role,
    });

    adminToken = jwtService.sign({
      sub: adminUser.email,
      email: adminUser.email,
      role: adminUser.role,
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.store.deleteMany({
      where: {
        name: {
          contains: 'Test E2E',
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [sellerUser.email, adminUser.email],
        },
      },
    });

    await app.close();
  });

  describe('POST /api/stores', () => {
    it('should create a new store for authenticated seller', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(validStoreData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: validStoreData.name,
        description: validStoreData.description,
        category: validStoreData.category,
        whatsappNumber: validStoreData.whatsappNumber,
        isVerified: false,
        ownerId: sellerId,
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.message).toBe('Store created successfully. Pending admin approval.');
    });

    it('should create store with optional fields', async () => {
      const storeWithOptional = {
        ...validStoreData,
        name: 'Test E2E Store with Optional',
        logoUrl: 'https://example.com/logo.jpg',
        latitude: 24.7136,
        longitude: 46.6753,
        instagramHandle: 'teste2estore',
      };

      const response = await request(app.getHttpServer())
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(storeWithOptional)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: storeWithOptional.name,
        logoUrl: storeWithOptional.logoUrl,
        latitude: storeWithOptional.latitude,
        longitude: storeWithOptional.longitude,
        instagramHandle: storeWithOptional.instagramHandle,
      });
    });

    it('should reject store creation for non-seller role', async () => {
      const buyerToken = jwtService.sign({
        sub: 'buyer-id',
        email: 'buyer@test.com',
        role: 'USER',
      });

      await request(app.getHttpServer())
        .post('/api/stores')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(validStoreData)
        .expect(403);
    });

    it('should reject store creation without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/stores')
        .send(validStoreData)
        .expect(401);
    });

    it('should validate store name length (min 3)', async () => {
      const invalidStore = {
        ...validStoreData,
        name: 'AB',
      };

      await request(app.getHttpServer())
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(invalidStore)
        .expect(400);
    });

    it('should validate store name length (max 100)', async () => {
      const invalidStore = {
        ...validStoreData,
        name: 'A'.repeat(101),
      };

      await request(app.getHttpServer())
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(invalidStore)
        .expect(400);
    });

    it('should validate description length (min 10)', async () => {
      const invalidStore = {
        ...validStoreData,
        description: 'Short',
      };

      await request(app.getHttpServer())
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(invalidStore)
        .expect(400);
    });

    it('should validate description length (max 500)', async () => {
      const invalidStore = {
        ...validStoreData,
        description: 'A'.repeat(501),
      };

      await request(app.getHttpServer())
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(invalidStore)
        .expect(400);
    });

    it('should validate WhatsApp number format', async () => {
      const invalidStore = {
        ...validStoreData,
        whatsappNumber: '0501234567',
      };

      await request(app.getHttpServer())
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(invalidStore)
        .expect(400);
    });

    it('should validate category enum', async () => {
      const invalidStore = {
        ...validStoreData,
        category: 'INVALID_CATEGORY',
      };

      await request(app.getHttpServer())
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(invalidStore)
        .expect(400);
    });

    it('should validate latitude range (Saudi bounds: 16-32)', async () => {
      const invalidStore = {
        ...validStoreData,
        latitude: 10.0,
      };

      await request(app.getHttpServer())
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(invalidStore)
        .expect(400);
    });

    it('should validate longitude range (Saudi bounds: 34-56)', async () => {
      const invalidStore = {
        ...validStoreData,
        longitude: 60.0,
      };

      await request(app.getHttpServer())
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(invalidStore)
        .expect(400);
    });

    it('should validate Instagram handle format (no @ symbol)', async () => {
      const invalidStore = {
        ...validStoreData,
        instagramHandle: '@invalid_handle',
      };

      await request(app.getHttpServer())
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(invalidStore)
        .expect(400);
    });

    it('should prevent seller from creating multiple verified stores', async () => {
      // Create a verified store first
      const verifiedStore = await prisma.store.create({
        data: {
          name: 'Verified E2E Store',
          description: 'Already verified',
          category: 'FOOD',
          whatsappNumber: '966501112233',
          isVerified: true,
          ownerId: sellerId,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          ...validStoreData,
          name: 'Second Store Attempt',
        })
        .expect(403);

      expect(response.body.message).toContain('already have a verified store');

      // Clean up
      await prisma.store.delete({
        where: {
          id: verifiedStore.id,
        },
      });
    });

    it('should allow admin to create stores', async () => {
      const adminStoreData = {
        ...validStoreData,
        name: 'Admin E2E Store',
      };

      const response = await request(app.getHttpServer())
        .post('/api/stores')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adminStoreData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(adminStoreData.name);
    });
  });

  describe('GET /api/stores/me/dashboard', () => {
    let testStoreId: string;

    beforeAll(async () => {
      // Create a test store with products
      const store = await prisma.store.create({
        data: {
          name: 'Dashboard Test Store',
          description: 'For dashboard testing',
          category: 'FOOD',
          whatsappNumber: '966504445566',
          ownerId: sellerId,
        },
      });
      testStoreId = store.id;

      // Create some products
      await prisma.product.createMany({
        data: [
          {
            name: 'Product 1',
            description: 'Test product 1',
            price: 50.0,
            imageUrls: ['https://example.com/p1.jpg'],
            category: 'FOOD',
            storeId: store.id,
          },
          {
            name: 'Product 2',
            description: 'Test product 2',
            price: 75.0,
            imageUrls: ['https://example.com/p2.jpg'],
            category: 'FOOD',
            storeId: store.id,
          },
        ],
      });
    });

    it('should return seller dashboard with stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/stores/me/dashboard')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stores).toBeInstanceOf(Array);
      expect(response.body.data.stores.length).toBeGreaterThan(0);

      const dashboardStore = response.body.data.stores.find(
        (s: any) => s.id === testStoreId
      );
      expect(dashboardStore).toBeDefined();
      expect(dashboardStore.stats).toBeDefined();
      expect(dashboardStore.stats.totalProducts).toBe(2);
    });

    it('should reject dashboard access for non-seller', async () => {
      const buyerToken = jwtService.sign({
        sub: 'buyer-id',
        email: 'buyer@test.com',
        role: 'USER',
      });

      await request(app.getHttpServer())
        .get('/api/stores/me/dashboard')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });

    it('should return empty array for seller with no stores', async () => {
      const newSeller = await prisma.user.create({
        data: {
          email: 'new.seller.e2e@test.com',
          password: await bcrypt.hash('Seller123!', 10),
          role: 'SELLER',
        },
      });

      const newSellerToken = jwtService.sign({
        sub: newSeller.id,
        email: newSeller.email,
        role: newSeller.role,
      });

      const response = await request(app.getHttpServer())
        .get('/api/stores/me/dashboard')
        .set('Authorization', `Bearer ${newSellerToken}`)
        .expect(200);

      expect(response.body.data.stores).toEqual([]);

      // Clean up
      await prisma.user.delete({
        where: {
          id: newSeller.id,
        },
      });
    });
  });
});
