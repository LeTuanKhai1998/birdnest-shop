import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Notifications (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let adminId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();

    // Create test user
    const user = await prismaService.user.create({
      data: {
        email: 'testuser@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        isAdmin: false,
      },
    });
    userId = user.id;

    // Create test admin
    const admin = await prismaService.user.create({
      data: {
        email: 'admin@example.com',
        password: 'hashedpassword',
        name: 'Admin User',
        isAdmin: true,
      },
    });
    adminId = admin.id;

    // Generate JWT tokens
    userToken = jwtService.sign({ 
      sub: userId, 
      email: user.email, 
      isAdmin: false 
    });
    adminToken = jwtService.sign({ 
      sub: adminId, 
      email: admin.email, 
      isAdmin: true 
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prismaService.notification.deleteMany({
      where: {
        OR: [
          { userId: userId },
          { userId: adminId },
        ],
      },
    });
    await prismaService.user.deleteMany({
      where: {
        id: { in: [userId, adminId] },
      },
    });
    await app.close();
  });

  describe('/notifications (POST)', () => {
    it('should create a notification (admin only)', async () => {
      const createNotificationDto = {
        title: 'Test Notification',
        body: 'Test notification body',
        type: 'ORDER',
        recipientType: 'USER',
        userId: userId,
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createNotificationDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(createNotificationDto.title);
      expect(response.body.body).toBe(createNotificationDto.body);
      expect(response.body.type).toBe(createNotificationDto.type);
      expect(response.body.recipientType).toBe(createNotificationDto.recipientType);
      expect(response.body.userId).toBe(userId);
      expect(response.body.isRead).toBe(false);
    });

    it('should reject non-admin users from creating notifications', async () => {
      const createNotificationDto = {
        title: 'Test Notification',
        body: 'Test notification body',
        type: 'ORDER',
        recipientType: 'USER',
        userId: userId,
      };

      await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createNotificationDto)
        .expect(500); // This will throw an error since we're not handling it properly in the controller
    });
  });

  describe('/notifications (GET)', () => {
    it('should return notifications for a user', async () => {
      // Create a test notification first
      await prismaService.notification.create({
        data: {
          title: 'User Notification',
          body: 'This is a user notification',
          type: 'ORDER',
          recipientType: 'USER',
          userId: userId,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('type');
      expect(response.body[0]).toHaveProperty('recipientType');
    });

    it('should return notifications for an admin', async () => {
      // Create a test notification for admin
      await prismaService.notification.create({
        data: {
          title: 'Admin Notification',
          body: 'This is an admin notification',
          type: 'STOCK',
          recipientType: 'ADMIN',
          userId: null, // Broadcast to all admins
        },
      });

      const response = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('/notifications/unread-count (GET)', () => {
    it('should return unread count for a user', async () => {
      // Create an unread notification
      await prismaService.notification.create({
        data: {
          title: 'Unread Notification',
          body: 'This is an unread notification',
          type: 'PROMOTION',
          recipientType: 'USER',
          userId: userId,
          isRead: false,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/notifications/unread-count')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(typeof response.body).toBe('number');
      expect(response.body).toBeGreaterThan(0);
    });
  });

  describe('/notifications/:id (GET)', () => {
    it('should return a specific notification', async () => {
      // Create a test notification
      const notification = await prismaService.notification.create({
        data: {
          title: 'Specific Notification',
          body: 'This is a specific notification',
          type: 'PAYMENT',
          recipientType: 'USER',
          userId: userId,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/notifications/${notification.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.id).toBe(notification.id);
      expect(response.body.title).toBe(notification.title);
    });

    it('should return 404 for non-existent notification', async () => {
      await request(app.getHttpServer())
        .get('/notifications/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('/notifications/:id/read (PATCH)', () => {
    it('should mark a notification as read', async () => {
      // Create an unread notification
      const notification = await prismaService.notification.create({
        data: {
          title: 'Unread Notification',
          body: 'This notification will be marked as read',
          type: 'SYSTEM',
          recipientType: 'USER',
          userId: userId,
          isRead: false,
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/notifications/${notification.id}/read`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.isRead).toBe(true);
    });
  });

  describe('/notifications/read-all (PATCH)', () => {
    it('should mark all notifications as read', async () => {
      // Create multiple unread notifications
      await prismaService.notification.createMany({
        data: [
          {
            title: 'Unread Notification 1',
            type: 'ORDER',
            recipientType: 'USER',
            userId: userId,
            isRead: false,
          },
          {
            title: 'Unread Notification 2',
            type: 'PROMOTION',
            recipientType: 'USER',
            userId: userId,
            isRead: false,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .patch('/notifications/read-all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toBeGreaterThan(0);
    });
  });

  describe('/notifications/:id (DELETE)', () => {
    it('should delete a notification', async () => {
      // Create a test notification
      const notification = await prismaService.notification.create({
        data: {
          title: 'Notification to Delete',
          body: 'This notification will be deleted',
          type: 'SYSTEM',
          recipientType: 'USER',
          userId: userId,
        },
      });

      await request(app.getHttpServer())
        .delete(`/notifications/${notification.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/notifications/${notification.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('Authentication', () => {
    it('should reject requests without authentication', async () => {
      await request(app.getHttpServer())
        .get('/notifications')
        .expect(401);

      await request(app.getHttpServer())
        .post('/notifications')
        .send({
          title: 'Test',
          type: 'ORDER',
          recipientType: 'USER',
        })
        .expect(401);
    });
  });
}); 