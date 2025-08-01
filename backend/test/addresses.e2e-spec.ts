import { INestApplication } from '@nestjs/common';
import { createTestingApp } from './test-setup';
import { PrismaService } from '../src/common/prisma.service';
import * as bcrypt from 'bcrypt';
import { TestApp, AuthResponse, AddressResponse } from './test-types';
import { createTestClient, TestClient, TestData } from './test-utils';

describe('Addresses API (e2e)', () => {
  let app: TestApp;
  let prisma: PrismaService;
  let client: TestClient;
  let userToken: string;
  let otherUserToken: string;
  let regularUser: { id: string; email: string; name: string | null };
  let otherUser: { id: string; email: string; name: string | null };
  let testAddress: AddressResponse;

  beforeAll(async () => {
    app = await createTestingApp();
    prisma = app.get<PrismaService>(PrismaService);

    // Clean up any existing test data
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();

    // Hash passwords properly
    const hashedPassword = await bcrypt.hash('test123', 10);

    // Create test users
    regularUser = await prisma.user.create({
      data: {
        email: 'addresses-user@test.com',
        password: hashedPassword,
        name: 'Regular User',
        isAdmin: false,
      },
    });

    otherUser = await prisma.user.create({
      data: {
        email: 'addresses-other@test.com',
        password: hashedPassword,
        name: 'Other User',
        isAdmin: false,
      },
    });

    // Login to get tokens
    const userLoginResponse: RequestResponse<AuthResponse> = await request(
      app.getHttpServer(),
    )
      .post('/api/auth/login')
      .send({
        email: 'addresses-user@test.com',
        password: 'test123',
      });

    const otherUserLoginResponse: RequestResponse<AuthResponse> = await request(
      app.getHttpServer(),
    )
      .post('/api/auth/login')
      .send({
        email: 'addresses-other@test.com',
        password: 'test123',
      });

    userToken = userLoginResponse.body.access_token;
    otherUserToken = otherUserLoginResponse.body.access_token;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('POST /api/addresses', () => {
    it('should create a new address for authenticated user', async () => {
      const addressData = {
        fullName: 'Test User',
        phone: '1234567890',
        province: 'Ho Chi Minh',
        district: 'District 1',
        ward: 'Ben Nghe',
        address: '123 Test Street',
        apartment: 'Apt 101',
        country: 'Vietnam',
        isDefault: true,
      };

      const response: RequestResponse<AddressResponse> = await request(
        app.getHttpServer(),
      )
        .post('/api/addresses')
        .set('Authorization', `Bearer ${userToken}`)
        .send(addressData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(regularUser.id);
      expect(response.body.fullName).toBe('Test User');
      expect(response.body.phone).toBe('1234567890');
      expect(response.body.province).toBe('Ho Chi Minh');
      expect(response.body.district).toBe('District 1');
      expect(response.body.ward).toBe('Ben Nghe');
      expect(response.body.address).toBe('123 Test Street');
      expect(response.body.apartment).toBe('Apt 101');
      expect(response.body.country).toBe('Vietnam');
      expect(response.body.isDefault).toBe(true);

      testAddress = response.body;
    });

    it('should reject address creation without authentication', async () => {
      const addressData = {
        fullName: 'Unauthorized User',
        phone: '0987654321',
        province: 'Ha Noi',
        district: 'Ba Dinh',
        ward: 'Phan Chu Trinh',
        address: '456 Unauthorized St',
        country: 'Vietnam',
      };

      await request(app.getHttpServer())
        .post('/api/addresses')
        .send(addressData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const invalidAddressData = {
        // Missing required fields
        phone: '1234567890',
      };

      await request(app.getHttpServer())
        .post('/api/addresses')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidAddressData)
        .expect(400);
    });
  });

  describe('GET /api/addresses', () => {
    it("should return user's addresses", async () => {
      const response = await request(app.getHttpServer())
        .get('/api/addresses')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].userId).toBe(regularUser.id);
    });

    it('should reject unauthenticated access', async () => {
      await request(app.getHttpServer()).get('/api/addresses').expect(401);
    });

    it('should only return addresses for the authenticated user', async () => {
      // Create an address for the other user
      await prisma.address.create({
        data: {
          userId: otherUser.id,
          fullName: 'Other User',
          phone: '0987654321',
          apartment: 'Other Apartment',
          province: 'Da Nang',
          district: 'Hai Chau',
          ward: 'Hai Chau 1',
          address: '789 Other Street',
          country: 'Vietnam',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/addresses')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Should only return addresses for the authenticated user
      response.body.forEach((address: any) => {
        expect(address.userId).toBe(regularUser.id);
      });
    });
  });

  describe('GET /api/addresses/:id', () => {
    it('should return specific address for owner', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/addresses/${testAddress.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.id).toBe(testAddress.id);
      expect(response.body.userId).toBe(regularUser.id);
    });

    it("should reject access to other user's address", async () => {
      // Create an address for the other user
      const otherUserAddress = await prisma.address.create({
        data: {
          userId: otherUser.id,
          fullName: 'Other User',
          phone: '0987654321',
          apartment: 'Other Apartment',
          province: 'Da Nang',
          district: 'Hai Chau',
          ward: 'Hai Chau 1',
          address: '789 Other Street',
          country: 'Vietnam',
        },
      });

      await request(app.getHttpServer())
        .get(`/api/addresses/${otherUserAddress.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      // Cleanup
      await prisma.address.delete({ where: { id: otherUserAddress.id } });
    });

    it('should return 404 for non-existent address', async () => {
      await request(app.getHttpServer())
        .get('/api/addresses/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/addresses/:id', () => {
    it('should update address for owner', async () => {
      const updateData = {
        fullName: 'Updated Test User',
        phone: '9876543210',
        address: '456 Updated Street',
        isDefault: false,
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/addresses/${testAddress.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.fullName).toBe('Updated Test User');
      expect(response.body.phone).toBe('9876543210');
      expect(response.body.address).toBe('456 Updated Street');
      expect(response.body.isDefault).toBe(false);
    });

    it("should reject update of other user's address", async () => {
      // Create an address for the other user
      const otherUserAddress = await prisma.address.create({
        data: {
          userId: otherUser.id,
          fullName: 'Other User',
          phone: '0987654321',
          apartment: 'Other Apartment',
          province: 'Da Nang',
          district: 'Hai Chau',
          ward: 'Hai Chau 1',
          address: '789 Other Street',
          country: 'Vietnam',
        },
      });

      const updateData = {
        fullName: 'Unauthorized Update',
      };

      await request(app.getHttpServer())
        .patch(`/api/addresses/${otherUserAddress.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);

      // Cleanup
      await prisma.address.delete({ where: { id: otherUserAddress.id } });
    });

    it('should return 404 for non-existent address', async () => {
      const updateData = {
        fullName: 'Non-existent Update',
      };

      await request(app.getHttpServer())
        .patch('/api/addresses/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/addresses/:id', () => {
    it('should delete address for owner', async () => {
      // Create a new address to delete
      const addressToDelete = await prisma.address.create({
        data: {
          userId: regularUser.id,
          fullName: 'Address to Delete',
          phone: '1111111111',
          apartment: 'Delete Apartment',
          province: 'Can Tho',
          district: 'Ninh Kieu',
          ward: 'Tan An',
          address: '999 Delete Street',
          country: 'Vietnam',
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/addresses/${addressToDelete.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/api/addresses/${addressToDelete.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it("should reject deletion of other user's address", async () => {
      // Create an address for the other user
      const otherUserAddress = await prisma.address.create({
        data: {
          userId: otherUser.id,
          fullName: 'Other User Address',
          phone: '2222222222',
          apartment: 'Other Apartment',
          province: 'Hue',
          district: 'Hue',
          ward: 'Phu Hoi',
          address: '888 Other Street',
          country: 'Vietnam',
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/addresses/${otherUserAddress.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      // Cleanup
      await prisma.address.delete({ where: { id: otherUserAddress.id } });
    });

    it('should return 404 for non-existent address', async () => {
      await request(app.getHttpServer())
        .delete('/api/addresses/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('Address validation', () => {
    it('should validate required fields', async () => {
      const invalidAddressData = {
        fullName: 'Test User',
        // Missing phone, province, district, ward, address, country
      };

      await request(app.getHttpServer())
        .post('/api/addresses')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidAddressData)
        .expect(400);
    });
  });
});
