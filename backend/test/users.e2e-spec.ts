import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestingApp } from './test-setup';
import { PrismaService } from '../src/common/prisma.service';

describe('Users API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;
  let adminUser: any;
  let regularUser: any;
  let otherUser: any;

  beforeAll(async () => {
    app = await createTestingApp();
    prisma = app.get<PrismaService>(PrismaService);

    // Create test users
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: '$2a$10$test',
        name: 'Admin User',
        isAdmin: true,
      },
    });

    regularUser = await prisma.user.create({
      data: {
        email: 'user@test.com',
        password: '$2a$10$test',
        name: 'Regular User',
        isAdmin: false,
      },
    });

    otherUser = await prisma.user.create({
      data: {
        email: 'other@test.com',
        password: '$2a$10$test',
        name: 'Other User',
        isAdmin: false,
      },
    });

    // Login to get tokens
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'test123',
      });

    const userLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'user@test.com',
        password: 'test123',
      });

    adminToken = adminLoginResponse.body.access_token;
    userToken = userLoginResponse.body.access_token;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('GET /api/users', () => {
    it('should return all users for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
      
      // Check that all users are returned
      const userEmails = response.body.map((user: any) => user.email);
      expect(userEmails).toContain('admin@test.com');
      expect(userEmails).toContain('user@test.com');
      expect(userEmails).toContain('other@test.com');
    });

    it('should reject non-admin access', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should reject unauthenticated access', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .expect(401);
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users?skip=0&take=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(2);
    });

    it('should support search by email', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users?search=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].email).toContain('admin');
    });
  });

  describe('GET /api/users/profile', () => {
    it('should return current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.id).toBe(regularUser.id);
      expect(response.body.email).toBe('user@test.com');
      expect(response.body.name).toBe('Regular User');
      expect(response.body.isAdmin).toBe(false);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return admin user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(adminUser.id);
      expect(response.body.email).toBe('admin@test.com');
      expect(response.body.name).toBe('Admin User');
      expect(response.body.isAdmin).toBe(true);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject unauthenticated access', async () => {
      await request(app.getHttpServer())
        .get('/api/users/profile')
        .expect(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user details for admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(regularUser.id);
      expect(response.body.email).toBe('user@test.com');
      expect(response.body.name).toBe('Regular User');
      expect(response.body.isAdmin).toBe(false);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should allow user to view their own profile', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.id).toBe(regularUser.id);
      expect(response.body.email).toBe('user@test.com');
    });

    it('should reject user access to other user profiles', async () => {
      await request(app.getHttpServer())
        .get(`/api/users/${otherUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should reject unauthenticated access', async () => {
      await request(app.getHttpServer())
        .get(`/api/users/${regularUser.id}`)
        .expect(401);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/api/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update user for admin', async () => {
      const updateData = {
        name: 'Updated Regular User',
        email: 'updated@test.com',
        isAdmin: false,
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Updated Regular User');
      expect(response.body.email).toBe('updated@test.com');
      expect(response.body.isAdmin).toBe(false);
    });

    it('should allow user to update their own profile', async () => {
      const updateData = {
        name: 'Self Updated User',
        bio: 'This is my bio',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Self Updated User');
      expect(response.body.bio).toBe('This is my bio');
    });

    it('should reject user update of other user profiles', async () => {
      const updateData = {
        name: 'Unauthorized Update',
      };

      await request(app.getHttpServer())
        .patch(`/api/users/${otherUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should reject unauthenticated access', async () => {
      const updateData = {
        name: 'Unauthorized Update',
      };

      await request(app.getHttpServer())
        .patch(`/api/users/${regularUser.id}`)
        .send(updateData)
        .expect(401);
    });

    it('should validate email format', async () => {
      const updateData = {
        email: 'invalid-email',
      };

      await request(app.getHttpServer())
        .patch(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(400);
    });

    it('should return 404 for non-existent user', async () => {
      const updateData = {
        name: 'Non-existent Update',
      };

      await request(app.getHttpServer())
        .patch('/api/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user for admin', async () => {
      // Create a user to delete
      const userToDelete = await prisma.user.create({
        data: {
          email: 'delete@test.com',
          password: '$2a$10$test',
          name: 'User to Delete',
          isAdmin: false,
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/users/${userToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify user is deleted
      await request(app.getHttpServer())
        .get(`/api/users/${userToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should reject non-admin deletion', async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${otherUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should reject unauthenticated access', async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${otherUser.id}`)
        .expect(401);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .delete('/api/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should prevent admin from deleting themselves', async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('User statistics', () => {
    it('should return user statistics for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('adminUsers');
      expect(response.body).toHaveProperty('regularUsers');
      expect(response.body).toHaveProperty('newUsersThisMonth');
      expect(typeof response.body.totalUsers).toBe('number');
      expect(typeof response.body.adminUsers).toBe('number');
      expect(typeof response.body.regularUsers).toBe('number');
      expect(typeof response.body.newUsersThisMonth).toBe('number');
    });

    it('should reject non-admin access to statistics', async () => {
      await request(app.getHttpServer())
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('User search and filtering', () => {
    it('should search users by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users?search=Regular')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].name).toContain('Regular');
    });

    it('should filter users by admin status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users?isAdmin=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((user: any) => {
        expect(user.isAdmin).toBe(true);
      });
    });

    it('should combine search and pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users?search=User&skip=0&take=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(1);
      if (response.body.length > 0) {
        expect(response.body[0].name).toContain('User');
      }
    });
  });
}); 