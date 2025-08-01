import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestingApp } from './test-setup';
import { PrismaService } from '../src/common/prisma.service';

describe('Settings API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;
  let adminUser: any;
  let regularUser: any;

  beforeAll(async () => {
    app = await createTestingApp();
    prisma = app.get<PrismaService>(PrismaService);

    // Clean up any existing test data in proper order
    await prisma.setting.deleteMany();
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.address.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.user.deleteMany();

    // Create test users with unique emails
    adminUser = await prisma.user.create({
      data: {
        email: 'settings-admin@test.com',
        password: '$2a$10$test',
        name: 'Settings Admin User',
        isAdmin: true,
      },
    });

    regularUser = await prisma.user.create({
      data: {
        email: 'settings-user@test.com',
        password: '$2a$10$test',
        name: 'Settings Regular User',
        isAdmin: false,
      },
    });

    // Login to get tokens
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'settings-admin@test.com',
        password: 'test123',
      });

    const userLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'settings-user@test.com',
        password: 'test123',
      });

    adminToken = adminLoginResponse.body.access_token;
    userToken = userLoginResponse.body.access_token;
  });

  afterAll(async () => {
    // Cleanup in proper order to avoid foreign key constraints
    await prisma.setting.deleteMany();
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.address.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('GET /api/settings', () => {
    it('should return all settings without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/settings')
        .expect(200);

      expect(response.body).toHaveProperty('store_name');
      expect(response.body).toHaveProperty('store_email');
      expect(response.body).toHaveProperty('default_language');
      expect(response.body).toHaveProperty('currency');
      expect(response.body).toHaveProperty('tax_percent');
      expect(response.body).toHaveProperty('free_shipping_threshold');
      expect(response.body).toHaveProperty('enable_stripe');
      expect(response.body).toHaveProperty('enable_momo');
      expect(response.body).toHaveProperty('enable_cod');
      expect(response.body).toHaveProperty('maintenance_mode');
    });

    it('should return default values when no settings exist', async () => {
      // Clear all settings first
      await prisma.setting.deleteMany();

      const response = await request(app.getHttpServer())
        .get('/api/settings')
        .expect(200);

      expect(response.body.store_name).toBe('Birdnest Shop');
      expect(response.body.store_email).toBe('contact@birdnest.com');
      expect(response.body.default_language).toBe('vi');
      expect(response.body.currency).toBe('VND');
      expect(response.body.tax_percent).toBe(10);
      expect(response.body.free_shipping_threshold).toBe(500000);
      expect(response.body.enable_stripe).toBe(true);
      expect(response.body.enable_momo).toBe(true);
      expect(response.body.enable_cod).toBe(true);
      expect(response.body.maintenance_mode).toBe(false);
    });
  });

  describe('POST /api/settings', () => {
    it('should create/update settings for admin', async () => {
      const settingsData = {
        store_name: 'Updated Birdnest Shop',
        store_email: 'updated@birdnest.com',
        default_language: 'en',
        currency: 'USD',
        tax_percent: 8,
        free_shipping_threshold: 1000000,
        enable_stripe: false,
        enable_momo: true,
        enable_cod: false,
        maintenance_mode: true,
      };

      const response = await request(app.getHttpServer())
        .post('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(settingsData)
        .expect(200);

      expect(response.body.store_name).toBe('Updated Birdnest Shop');
      expect(response.body.store_email).toBe('updated@birdnest.com');
      expect(response.body.default_language).toBe('en');
      expect(response.body.currency).toBe('USD');
      expect(response.body.tax_percent).toBe(8);
      expect(response.body.free_shipping_threshold).toBe(1000000);
      expect(response.body.enable_stripe).toBe(false);
      expect(response.body.enable_momo).toBe(true);
      expect(response.body.enable_cod).toBe(false);
      expect(response.body.maintenance_mode).toBe(true);
    });

    it('should reject non-admin access', async () => {
      const settingsData = {
        store_name: 'Unauthorized Update',
      };

      await request(app.getHttpServer())
        .post('/api/settings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(settingsData)
        .expect(403);
    });

    it('should reject unauthenticated access', async () => {
      const settingsData = {
        store_name: 'Unauthorized Update',
      };

      await request(app.getHttpServer())
        .post('/api/settings')
        .send(settingsData)
        .expect(401);
    });

    it('should update partial settings', async () => {
      const partialSettings = {
        store_name: 'Partial Update Shop',
        tax_percent: 12,
      };

      const response = await request(app.getHttpServer())
        .post('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(partialSettings)
        .expect(200);

      expect(response.body.store_name).toBe('Partial Update Shop');
      expect(response.body.tax_percent).toBe(12);
      // Other settings should remain unchanged
      expect(response.body.store_email).toBe('updated@birdnest.com');
      expect(response.body.default_language).toBe('en');
    });

    it('should validate numeric values', async () => {
      const invalidSettings = {
        tax_percent: 'invalid',
        free_shipping_threshold: -100,
      };

      await request(app.getHttpServer())
        .post('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidSettings)
        .expect(400);
    });

    it('should validate boolean values', async () => {
      const invalidSettings = {
        enable_stripe: 'not_boolean',
        maintenance_mode: 123,
      };

      await request(app.getHttpServer())
        .post('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidSettings)
        .expect(400);
    });
  });

  describe('Settings persistence', () => {
    it('should persist settings across requests', async () => {
      // Set a specific setting
      const testSettings = {
        store_name: 'Persistent Test Shop',
        maintenance_mode: true,
      };

      await request(app.getHttpServer())
        .post('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testSettings)
        .expect(200);

      // Verify the setting persists
      const getResponse = await request(app.getHttpServer())
        .get('/api/settings')
        .expect(200);

      expect(getResponse.body.store_name).toBe('Persistent Test Shop');
      expect(getResponse.body.maintenance_mode).toBe(true);
    });
  });
});
