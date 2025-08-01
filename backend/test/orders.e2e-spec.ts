import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestingApp } from './test-setup';
import { PrismaService } from '../src/common/prisma.service';
import { OrderStatus, PaymentMethod } from '@prisma/client';

describe('Orders API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;
  let adminUser: any;
  let regularUser: any;
  let testProduct: any;
  let testOrder: any;

  beforeAll(async () => {
    app = await createTestingApp();
    prisma = app.get<PrismaService>(PrismaService);

    // Clean up any existing test data
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.review.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // Create test users with unique emails
    adminUser = await prisma.user.create({
      data: {
        email: 'orders-admin@test.com',
        password: '$2a$10$test',
        name: 'Orders Admin User',
        isAdmin: true,
      },
    });

    regularUser = await prisma.user.create({
      data: {
        email: 'orders-user@test.com',
        password: '$2a$10$test',
        name: 'Orders Regular User',
        isAdmin: false,
      },
    });

    // Create test product with unique name
    const category = await prisma.category.create({
      data: {
        name: 'Orders Test Category',
        slug: 'orders-test-category',
      },
    });

    testProduct = await prisma.product.create({
      data: {
        name: 'Orders Test Product',
        slug: 'orders-test-product',
        description: 'Orders test product description',
        price: 100000,
        quantity: 10,
        categoryId: category.id,
        weight: 100,
      },
    });

    // Login to get tokens
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'orders-admin@test.com',
        password: 'test123',
      });

    const userLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'orders-user@test.com',
        password: 'test123',
      });

    adminToken = adminLoginResponse.body.access_token;
    userToken = userLoginResponse.body.access_token;
  });

  afterAll(async () => {
    // Cleanup in proper order to avoid foreign key constraints
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.review.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('POST /api/orders', () => {
    it('should create a new order for authenticated user', async () => {
      const orderData = {
        items: [
          {
            productId: testProduct.id,
            quantity: 2,
          },
        ],
        shippingAddress: {
          fullName: 'Test User',
          phone: '1234567890',
          email: 'test@example.com',
          address: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country',
        },
        deliveryFee: 0,
        paymentMethod: 'COD',
      };

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(regularUser.id);
      expect(response.body.status).toBe('PENDING');
      expect(response.body.paymentMethod).toBe('COD');
      expect(response.body.orderItems).toHaveLength(1);
      expect(response.body.orderItems[0].productId).toBe(testProduct.id);
      expect(response.body.orderItems[0].quantity).toBe(2);

      testOrder = response.body;
    });

    it('should reject order creation without authentication', async () => {
      const orderData = {
        items: [{ productId: testProduct.id, quantity: 1 }],
        shippingAddress: { fullName: 'Test' },
        deliveryFee: 0,
        paymentMethod: 'COD',
      };

      await request(app.getHttpServer())
        .post('/api/orders')
        .send(orderData)
        .expect(401);
    });
  });

  describe('POST /api/orders/guest', () => {
    it('should create a guest order without authentication', async () => {
      const guestOrderData = {
        info: {
          fullName: 'Guest User',
          phone: '0987654321',
          email: 'guest@example.com',
          province: 'Test Province',
          district: 'Test District',
          ward: 'Test Ward',
          address: '456 Guest St',
          apartment: 'Apt 1',
          note: 'Test note',
        },
        products: [
          {
            productId: testProduct.id,
            quantity: 1,
          },
        ],
        deliveryFee: 5000,
        paymentMethod: 'BANK_TRANSFER',
      };

      const response = await request(app.getHttpServer())
        .post('/api/orders/guest')
        .send(guestOrderData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBeNull();
      expect(response.body.guestEmail).toBe('guest@example.com');
      expect(response.body.guestName).toBe('Guest User');
      expect(response.body.guestPhone).toBe('0987654321');
      expect(response.body.status).toBe('PENDING');
      expect(response.body.paymentMethod).toBe('BANK_TRANSFER');
    });
  });

  describe('GET /api/orders', () => {
    it('should return all orders for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should reject non-admin access', async () => {
      await request(app.getHttpServer())
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should reject unauthenticated access', async () => {
      await request(app.getHttpServer()).get('/api/orders').expect(401);
    });
  });

  describe('GET /api/orders/my-orders', () => {
    it("should return user's own orders", async () => {
      const response = await request(app.getHttpServer())
        .get('/api/orders/my-orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].userId).toBe(regularUser.id);
    });

    it('should reject unauthenticated access', async () => {
      await request(app.getHttpServer())
        .get('/api/orders/my-orders')
        .expect(401);
    });
  });

  describe('GET /api/orders/stats', () => {
    it('should return order statistics for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/orders/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('ordersByStatus');
      expect(typeof response.body.totalOrders).toBe('number');
      expect(typeof response.body.totalRevenue).toBe('string');
      expect(Array.isArray(response.body.ordersByStatus)).toBe(true);
    });

    it('should reject non-admin access', async () => {
      await request(app.getHttpServer())
        .get('/api/orders/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return order details for owner', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.id).toBe(testOrder.id);
      expect(response.body.userId).toBe(regularUser.id);
    });

    it('should return order details for admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(testOrder.id);
    });

    it("should reject access to other user's order", async () => {
      // Create another user and try to access the order
      const otherUser = await prisma.user.create({
        data: {
          email: 'orders-other@test.com',
          password: '$2a$10$test',
          name: 'Orders Other User',
          isAdmin: false,
        },
      });

      const otherUserOrder = await prisma.order.create({
        data: {
          userId: otherUser.id,
          total: 100000,
          status: 'PENDING',
          paymentMethod: 'COD',
          shippingAddress: 'Test Address',
        },
      });

      await request(app.getHttpServer())
        .get(`/api/orders/${otherUserOrder.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      // Cleanup
      await prisma.order.delete({ where: { id: otherUserOrder.id } });
      await prisma.user.delete({ where: { id: otherUser.id } });
    });

    it('should return 404 for non-existent order', async () => {
      await request(app.getHttpServer())
        .get('/api/orders/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('should update order status for admin', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'SHIPPED' })
        .expect(200);

      expect(response.body.status).toBe('SHIPPED');
    });

    it('should reject non-admin access', async () => {
      await request(app.getHttpServer())
        .patch(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'SHIPPED' })
        .expect(403);
    });
  });

  describe('POST /api/orders/guest/search', () => {
    it('should search guest orders by email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders/guest/search')
        .send({ query: 'guest@example.com' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].guestEmail).toBe('guest@example.com');
    });

    it('should search guest orders by phone', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders/guest/search')
        .send({ query: '0987654321' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].guestPhone).toBe('0987654321');
    });

    it('should return empty array for non-existent guest', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders/guest/search')
        .send({ query: 'nonexistent@example.com' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });
});
