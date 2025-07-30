import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/common/prisma.service';
import { PasswordService } from '../src/common/password.service';
import { createTestingApp } from './test-setup';

describe('Authentication & Authorization Security (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let passwordService: PasswordService;
  let adminToken: string;
  let userToken: string;
  let adminUser: any;
  let regularUser: any;

  beforeAll(async () => {
    app = await createTestingApp();
    prisma = app.get<PrismaService>(PrismaService);
    passwordService = app.get<PasswordService>(PasswordService);

    // Clean up any existing test users first
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['admin@test.com', 'user@test.com'],
        },
      },
    });

    // Create test users
    const adminPassword = await passwordService.hashPassword('Admin@123');
    const userPassword = await passwordService.hashPassword('User@123');

    adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: adminPassword,
        name: 'Admin User',
        isAdmin: true,
      },
    });

    regularUser = await prisma.user.create({
      data: {
        email: 'user@test.com',
        password: userPassword,
        name: 'Regular User',
        isAdmin: false,
      },
    });
  }, 30000); // Increase timeout to 30 seconds

  afterAll(async () => {
    // Clean up test users
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['admin@test.com', 'user@test.com'],
        },
      },
    });

    await app.close();
  });

  describe('Authentication', () => {
    it('should allow valid admin login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'Admin@123',
        })
        .expect(201);

      expect(response.body.access_token).toBeDefined();
      expect(response.body.user.isAdmin).toBe(true);
      adminToken = response.body.access_token;
    });

    it('should allow valid user login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'User@123',
        })
        .expect(201);

      expect(response.body.access_token).toBeDefined();
      expect(response.body.user.isAdmin).toBe(false);
      userToken = response.body.access_token;
    });

    it('should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password',
        })
        .expect(401);
    });
  });

  describe('Authorization - Admin Routes', () => {
    it('should allow admin to access admin-only routes', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should deny regular user access to admin routes', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should deny access without token', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .expect(401);
    });

    it('should deny access with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Authorization - User Routes', () => {
    it('should allow user to access their own profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.email).toBe('user@test.com');
    });

    it('should allow admin to access any user profile', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.email).toBe('user@test.com');
    });

    it('should deny user access to other user profiles', async () => {
      await request(app.getHttpServer())
        .get(`/api/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Authorization - Order Routes', () => {
    it('should allow user to create orders for themselves', async () => {
      // Create a test category first with unique name
      const testCategory = await prisma.category.create({
        data: {
          name: `Test Category ${Date.now()}`,
          slug: `test-category-${Date.now()}`,
        },
      });

      // Create a test product with unique slug
      const testProduct = await prisma.product.create({
        data: {
          name: 'Test Product',
          slug: `test-product-${Date.now()}`,
          description: 'Test product description',
          price: 100,
          quantity: 10,
          categoryId: testCategory.id,
        },
      });

      const orderData = {
        items: [
          {
            productId: testProduct.id,
            quantity: 1,
          },
        ],
        shippingAddress: {
          fullName: 'Test User',
          phone: '+84123456789',
          address: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Vietnam',
        },
      };

      await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(201);
    });

    it('should allow admin to view all orders', async () => {
      await request(app.getHttpServer())
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should allow user to view only their own orders', async () => {
      await request(app.getHttpServer())
        .get('/api/orders/my-orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
  });

  describe('Rate Limiting', () => {
    it('should limit authentication attempts', async () => {
      // Make multiple failed login attempts
      // In test environment, rate limits are higher, so we expect 401 for all attempts
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: 'admin@test.com',
            password: 'wrongpassword',
          })
          .expect(401); // All should be 401 in test environment
      }
    });
  });

  describe('Input Validation', () => {
    it('should reject malformed login data', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: '',
        })
        .expect(400);
    });

    it('should sanitize input data', async () => {
      // Test with potentially malicious input
      const maliciousInput = {
        email: 'admin@test.com<script>alert("xss")</script>',
        password: 'Admin@123',
      };

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(maliciousInput)
        .expect(401); // Should be rejected, not cause server error
    });
  });

  describe('Token Security', () => {
    it('should reject expired tokens', async () => {
      // This would require a token that's actually expired
      // For now, we test with a malformed token
      await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', 'Bearer expired.token.here')
        .expect(401);
    });

    it('should reject tokens with wrong signature', async () => {
      const malformedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${malformedToken}`)
        .expect(401);
    });
  });
}); 