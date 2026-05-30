import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/config/database';

describe('Discovery (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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

  describe('GET /api/discovery', () => {
    it('should return discovery feed grouped by category', async () => {
      const response = await request(app.get('/api/discovery?groupBy=category&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('groups');
      expect(response.body.data).toHaveProperty('metadata');
    });

    it('should return discovery feed grouped by region', async () => {
      const response = await request(app.get('/api/discovery?groupBy=region&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('groups');
    });

    it('should validate required groupBy parameter', async () => {
      const response = await request(app.get('/api/discovery?limit=10')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/discovery/trending', () => {
    it('should return trending products', async () => {
      const response = await request(app.get('/api/discovery/trending?period=7d&limit=20'))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('trending');
      expect(response.body.data).toHaveProperty('metadata');
    });

    it('should support filtering by category', async () => {
      const response = await request(app.get('/api/discovery/trending?category=FOOD&limit=20'))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/discovery/new', () => {
    it('should return new products', async () => {
      const response = await request(app.get('/api/discovery/new?days=7&limit=20'))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('newProducts');
      expect(response.body.data).toHaveProperty('metadata');
    });

    it('should support custom days parameter', async () => {
      const response = await request(app.get('/api/discovery/new?days=30&limit=20'))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/discovery/categories', () => {
    it('should return all categories with counts', async () => {
      const response = await request(app.get('/api/discovery/categories'))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('categories');
      expect(response.body.data.categories).toBeInstanceOf(Array);
    });
  });
});
