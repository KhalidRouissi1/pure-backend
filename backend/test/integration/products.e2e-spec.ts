import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/config/database';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.cleanDatabase();
  });

  describe('POST /api/auth/register and login', () => {
    it('should register and login a user', async () => {
      const registerResponse = await request(app.get('/api/auth/register'))
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          role: 'USER',
        })
        .expect(201);

      expect(registerResponse.body).toHaveProperty('success', true);
      expect(registerResponse.body.data).toHaveProperty('accessToken');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product', async () => {
      const response = await request(app.get('/api/products/1'))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app.get('/api/products/nonexistent'))
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /api/products', () => {
    it('should return paginated products', async () => {
      const response = await request(app.get('/api/products?page=1&limit=20'))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should filter by category', async () => {
      const response = await request(app.get('/api/products?category=FOOD&page=1&limit=20'))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should filter by store', async () => {
      const response = await request(app.get('/api/products?storeId=1&page=1&limit=20'))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/products/:id/favorite', () => {
    it('should add product to favorites (authenticated)', async () => {
      const response = await request(app.post('/api/products/1/favorite'))
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('added to favorites');
    });

    it('should require authentication', async () => {
      const response = await request(app.post('/api/products/1/favorite'))
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 409 if already favorited', async () => {
      const response = await request(app.post('/api/products/1/favorite'))
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('already in favorites');
    });
  });

  describe('DELETE /api/products/:id/favorite', () => {
    it('should remove product from favorites (authenticated)', async () => {
      const response = await request(app.delete('/api/products/1/favorite'))
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('removed from favorites');
    });

    it('should require authentication', async () => {
      const response = await request(app.delete('/api/products/1/favorite'))
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 404 if not in favorites', async () => {
      const response = await request(app.delete('/api/products/1/favorite'))
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('not in favorites');
    });
  });

  describe('GET /api/products/favorites/me', () => {
    it('should return user favorites (authenticated)', async () => {
      const response = await request(app.get('/api/products/favorites/me?page=1&limit=20'))
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('favorites');
    });

    it('should require authentication', async () => {
      const response = await request(app.get('/api/products/favorites/me'))
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});

describe('Products E2E (Seller Management - POST /api/products)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let sellerToken: string;
  let sellerId: string;
  let testStoreId: string;
  let adminToken: string;

  const sellerUser = {
    email: 'seller.products.e2e@test.com',
    password: 'Seller123!',
    role: 'SELLER',
  };

  const adminUser = {
    email: 'admin.products.e2e@test.com',
    password: 'Admin123!',
    role: 'ADMIN',
  };

  const validProductData = {
    name: 'Test E2E Product',
    description: 'A test product for E2E testing with sufficient description length',
    price: 99.99,
    imageUrls: ['https://res.cloudinary.com/test/image/upload/v1/test.jpg'],
    category: 'FOOD',
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
    await prisma.product.deleteMany({
      where: {
        name: {
          contains: 'Test E2E Product',
        },
      },
    });
    await prisma.store.deleteMany({
      where: {
        name: {
          contains: 'Test E2E Store',
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

    // Create verified store for seller
    const store = await prisma.store.create({
      data: {
        name: 'Test E2E Store for Products',
        description: 'A test store for product E2E testing',
        category: 'FOOD',
        whatsappNumber: '966509876543',
        isVerified: true,
        ownerId: sellerId,
      },
    });
    testStoreId = store.id;

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
    await prisma.product.deleteMany({
      where: {
        name: {
          contains: 'Test E2E Product',
        },
      },
    });
    await prisma.store.deleteMany({
      where: {
        name: {
          contains: 'Test E2E Store',
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

  describe('POST /api/products', () => {
    it('should create a new product for authenticated seller', async () => {
      const productData = {
        ...validProductData,
        storeId: testStoreId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: productData.name,
        description: productData.description,
        price: productData.price.toFixed(2),
        imageUrls: productData.imageUrls,
        category: productData.category,
        storeId: productData.storeId,
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.message).toBe('Product created successfully');
    });

    it('should reject product creation for non-seller role', async () => {
      const buyerToken = jwtService.sign({
        sub: 'buyer-id',
        email: 'buyer@test.com',
        role: 'USER',
      });

      await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          ...validProductData,
          storeId: testStoreId,
        })
        .expect(403);
    });

    it('should reject product for unverified store', async () => {
      // Create unverified store
      const unverifiedStore = await prisma.store.create({
        data: {
          name: 'Unverified Store',
          description: 'Not verified yet',
          category: 'FOOD',
          whatsappNumber: '966501112233',
          isVerified: false,
          ownerId: sellerId,
        },
      });

      await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          ...validProductData,
          storeId: unverifiedStore.id,
        })
        .expect(403);

      // Clean up
      await prisma.store.delete({
        where: {
          id: unverifiedStore.id,
        },
      });
    });
  });

  describe('PATCH /api/products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      // Create a product to update
      const product = await prisma.product.create({
        data: {
          ...validProductData,
          name: 'Product to Update',
          storeId: testStoreId,
        },
      });
      productId = product.id;
    });

    it('should update product for seller', async () => {
      const updateData = {
        name: 'Updated Product Name',
        price: 149.99,
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price.toFixed(2));
    });

    it('should reject update for non-owner seller', async () => {
      const otherSeller = await prisma.user.create({
        data: {
          email: 'update.other.seller.e2e@test.com',
          password: await bcrypt.hash('Seller123!', 10),
          role: 'SELLER',
        },
      });

      const otherSellerToken = jwtService.sign({
        sub: otherSeller.id,
        email: otherSeller.email,
        role: otherSeller.role,
      });

      await request(app.getHttpServer())
        .patch(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${otherSellerToken}`)
        .send({ name: 'Hacked Name' })
        .expect(403);

      // Clean up
      await prisma.user.delete({
        where: {
          id: otherSeller.id,
        },
      });
    });
  });

  describe('DELETE /api/products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      // Create a product to delete
      const product = await prisma.product.create({
        data: {
          ...validProductData,
          name: 'Product to Delete',
          storeId: testStoreId,
        },
      });
      productId = product.id;
    });

    it('should delete product for seller', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product deleted successfully');

      // Verify product is deleted
      const deletedProduct = await prisma.product.findUnique({
        where: { id: productId },
      });
      expect(deletedProduct).toBeNull();
    });
  });
});
