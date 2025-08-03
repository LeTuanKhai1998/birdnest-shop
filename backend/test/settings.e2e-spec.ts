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

      expect(response.body).toHaveProperty('storeName');
      expect(response.body).toHaveProperty('storeEmail');
      expect(response.body).toHaveProperty('currency');
      expect(response.body).toHaveProperty('taxPercent');
      expect(response.body).toHaveProperty('freeShippingThreshold');
      expect(response.body).toHaveProperty('enableStripe');
      expect(response.body).toHaveProperty('enableMomo');
      expect(response.body).toHaveProperty('enableCOD');
      expect(response.body).toHaveProperty('maintenanceMode');
    });

    it('should return default values when no settings exist', async () => {
      // Clear all settings first
      await prisma.setting.deleteMany();

      const response = await request(app.getHttpServer())
        .get('/api/settings')
        .expect(200);

      expect(response.body.storeName).toBe('Birdnest Shop');
      expect(response.body.storeEmail).toBe('admin@birdnest.com');
      expect(response.body.currency).toBe('VND');
      expect(response.body.taxPercent).toBe(0);
      expect(response.body.freeShippingThreshold).toBe(0);
      expect(response.body.enableStripe).toBe(false);
      expect(response.body.enableMomo).toBe(false);
      expect(response.body.enableCOD).toBe(false);
      expect(response.body.maintenanceMode).toBe(false);
    });
  });

  describe('POST /api/settings', () => {
    it('should create/update settings for admin', async () => {
      const settingsData = {
        storeName: 'Updated Birdnest Shop',
        storeEmail: 'updated@birdnest.com',
        currency: 'USD',
        taxPercent: 8,
        freeShippingThreshold: 1000000,
        enableStripe: false,
        enableMomo: true,
        enableCOD: false,
        maintenanceMode: true,
      };

      const response = await request(app.getHttpServer())
        .post('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(settingsData)
        .expect(200);

      expect(response.body.storeName).toBe('Updated Birdnest Shop');
      expect(response.body.storeEmail).toBe('updated@birdnest.com');
      expect(response.body.currency).toBe('USD');
      expect(response.body.taxPercent).toBe(8);
      expect(response.body.freeShippingThreshold).toBe(1000000);
      expect(response.body.enableStripe).toBe(false);
      expect(response.body.enableMomo).toBe(true);
      expect(response.body.enableCOD).toBe(false);
      expect(response.body.maintenanceMode).toBe(true);
    });

    it('should reject non-admin access', async () => {
      const settingsData = {
        storeName: 'Unauthorized Update',
      };

      await request(app.getHttpServer())
        .post('/api/settings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(settingsData)
        .expect(403);
    });

    it('should reject unauthenticated access', async () => {
      const settingsData = {
        storeName: 'Unauthorized Update',
      };

      await request(app.getHttpServer())
        .post('/api/settings')
        .send(settingsData)
        .expect(401);
    });

    it('should update partial settings', async () => {
      const partialSettings = {
        storeName: 'Partial Update Shop',
        taxPercent: 12,
      };

      const response = await request(app.getHttpServer())
        .post('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(partialSettings)
        .expect(200);

      expect(response.body.storeName).toBe('Partial Update Shop');
      expect(response.body.taxPercent).toBe(12);
      // Other settings should remain unchanged
      expect(response.body.storeEmail).toBe('updated@birdnest.com');
    });

    it('should validate numeric values', async () => {
      const invalidSettings = {
        taxPercent: 'invalid',
        freeShippingThreshold: -100,
      };

      await request(app.getHttpServer())
        .post('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidSettings)
        .expect(400);
    });

    it('should validate boolean values', async () => {
      const invalidSettings = {
        enableStripe: 'not_boolean',
        maintenanceMode: 123,
      };

      await request(app.getHttpServer())
        .post('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidSettings)
        .expect(400);
    });
  });

  describe('PATCH /api/settings', () => {
    it('should update settings for admin', async () => {
      const settingsData = {
        storeName: 'Patched Birdnest Shop',
        storeEmail: 'patched@birdnest.com',
        currency: 'EUR',
        taxPercent: 15,
        freeShippingThreshold: 750000,
        enableStripe: true,
        enableMomo: false,
        enableCOD: true,
        maintenanceMode: false,
      };

      const response = await request(app.getHttpServer())
        .patch('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(settingsData)
        .expect(200);

      expect(response.body.storeName).toBe('Patched Birdnest Shop');
      expect(response.body.storeEmail).toBe('patched@birdnest.com');
      expect(response.body.currency).toBe('EUR');
      expect(response.body.taxPercent).toBe(15);
      expect(response.body.freeShippingThreshold).toBe(750000);
      expect(response.body.enableStripe).toBe(true);
      expect(response.body.enableMomo).toBe(false);
      expect(response.body.enableCOD).toBe(true);
      expect(response.body.maintenanceMode).toBe(false);
    });

    it('should reject non-admin access for PATCH', async () => {
      const settingsData = {
        storeName: 'Unauthorized PATCH Update',
      };

      await request(app.getHttpServer())
        .patch('/api/settings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(settingsData)
        .expect(403);
    });

    it('should reject unauthenticated access for PATCH', async () => {
      const settingsData = {
        storeName: 'Unauthorized PATCH Update',
      };

      await request(app.getHttpServer())
        .patch('/api/settings')
        .send(settingsData)
        .expect(401);
    });

    it('should update partial settings via PATCH', async () => {
      const partialSettings = {
        storeName: 'PATCH Partial Update Shop',
        taxPercent: 18,
      };

      const response = await request(app.getHttpServer())
        .patch('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(partialSettings)
        .expect(200);

      expect(response.body.storeName).toBe('PATCH Partial Update Shop');
      expect(response.body.taxPercent).toBe(18);
      // Other settings should remain unchanged
      expect(response.body.storeEmail).toBe('patched@birdnest.com');
    });
  });

  describe('Settings persistence', () => {
    it('should persist settings across requests', async () => {
      // Set a specific setting
      const testSettings = {
        storeName: 'Persistent Test Shop',
        maintenanceMode: true,
      };

      await request(app.getHttpServer())
        .patch('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testSettings)
        .expect(200);

      // Verify the setting persists
      const getResponse = await request(app.getHttpServer())
        .get('/api/settings')
        .expect(200);

      expect(getResponse.body.storeName).toBe('Persistent Test Shop');
      expect(getResponse.body.maintenanceMode).toBe(true);
    });
  });
});
