import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  AuthResponse,
  UserResponse,
  ProductResponse,
  OrderResponse,
  AddressResponse,
  NotificationResponse,
  SettingsResponse,
  StatsResponse,
  RequestResponse,
} from './test-types';

// Typed request helpers
export class TestClient {
  constructor(private app: INestApplication) {}

  // Auth requests
  async login(
    email: string,
    password: string,
  ): Promise<RequestResponse<AuthResponse>> {
    return request(this.app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password });
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<RequestResponse<AuthResponse>> {
    return request(this.app.getHttpServer())
      .post('/api/auth/register')
      .send(userData);
  }

  // User requests
  async getUsers(token: string): Promise<RequestResponse<UserResponse[]>> {
    return request(this.app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
  }

  async getUserProfile(token: string): Promise<RequestResponse<UserResponse>> {
    return request(this.app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
  }

  async updateUser(
    id: string,
    data: Partial<UserResponse>,
    token: string,
  ): Promise<RequestResponse<UserResponse>> {
    return request(this.app.getHttpServer())
      .patch(`/api/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(data);
  }

  // Product requests
  async getProducts(params?: {
    categoryId?: string;
    search?: string;
  }): Promise<RequestResponse<ProductResponse[]>> {
    const req = request(this.app.getHttpServer()).get('/api/products');
    if (params?.categoryId) req.query({ categoryId: params.categoryId });
    if (params?.search) req.query({ search: params.search });
    return req;
  }

  async getProduct(id: string): Promise<RequestResponse<ProductResponse>> {
    return request(this.app.getHttpServer()).get(`/api/products/${id}`);
  }

  async createProduct(
    data: Partial<ProductResponse>,
    token: string,
  ): Promise<RequestResponse<ProductResponse>> {
    return request(this.app.getHttpServer())
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(data);
  }

  // Order requests
  async createOrder(
    data: Partial<OrderResponse>,
    token?: string,
  ): Promise<RequestResponse<OrderResponse>> {
    const req = request(this.app.getHttpServer())
      .post('/api/orders')
      .send(data);
    if (token) req.set('Authorization', `Bearer ${token}`);
    return req;
  }

  async getOrders(token: string): Promise<RequestResponse<OrderResponse[]>> {
    return request(this.app.getHttpServer())
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);
  }

  async getOrder(
    id: string,
    token: string,
  ): Promise<RequestResponse<OrderResponse>> {
    return request(this.app.getHttpServer())
      .get(`/api/orders/${id}`)
      .set('Authorization', `Bearer ${token}`);
  }

  async updateOrderStatus(
    id: string,
    status: string,
    token: string,
  ): Promise<RequestResponse<OrderResponse>> {
    return request(this.app.getHttpServer())
      .patch(`/api/orders/${id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status });
  }

  async searchGuestOrders(
    query: string,
  ): Promise<RequestResponse<OrderResponse[]>> {
    return request(this.app.getHttpServer())
      .post('/api/orders/guest/search')
      .send({ query });
  }

  // Address requests
  async createAddress(
    data: Partial<AddressResponse>,
    token: string,
  ): Promise<RequestResponse<AddressResponse>> {
    return request(this.app.getHttpServer())
      .post('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send(data);
  }

  async getAddresses(
    token: string,
  ): Promise<RequestResponse<AddressResponse[]>> {
    return request(this.app.getHttpServer())
      .get('/api/addresses')
      .set('Authorization', `Bearer ${token}`);
  }

  async updateAddress(
    id: string,
    data: Partial<AddressResponse>,
    token: string,
  ): Promise<RequestResponse<AddressResponse>> {
    return request(this.app.getHttpServer())
      .patch(`/api/addresses/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(data);
  }

  async deleteAddress(
    id: string,
    token: string,
  ): Promise<RequestResponse<void>> {
    return request(this.app.getHttpServer())
      .delete(`/api/addresses/${id}`)
      .set('Authorization', `Bearer ${token}`);
  }

  // Notification requests
  async getNotifications(
    token: string,
  ): Promise<RequestResponse<NotificationResponse[]>> {
    return request(this.app.getHttpServer())
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);
  }

  async markNotificationRead(
    id: string,
    token: string,
  ): Promise<RequestResponse<NotificationResponse>> {
    return request(this.app.getHttpServer())
      .patch(`/api/notifications/${id}/read`)
      .set('Authorization', `Bearer ${token}`);
  }

  async markAllNotificationsRead(
    token: string,
  ): Promise<RequestResponse<void>> {
    return request(this.app.getHttpServer())
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${token}`);
  }

  async getUnreadCount(
    token: string,
  ): Promise<RequestResponse<{ count: number }>> {
    return request(this.app.getHttpServer())
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);
  }

  // Settings requests
  async getSettings(token: string): Promise<RequestResponse<SettingsResponse>> {
    return request(this.app.getHttpServer())
      .get('/api/settings')
      .set('Authorization', `Bearer ${token}`);
  }

  async updateSettings(
    data: Partial<SettingsResponse>,
    token: string,
  ): Promise<RequestResponse<SettingsResponse>> {
    return request(this.app.getHttpServer())
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send(data);
  }

  // Health requests
  async getHealth(): Promise<
    RequestResponse<{ status: string; timestamp: string; uptime: number }>
  > {
    return request(this.app.getHttpServer()).get('/api/health');
  }

  async getHealthInfo(): Promise<
    RequestResponse<{ info: Record<string, unknown> }>
  > {
    return request(this.app.getHttpServer()).get('/api/health/info');
  }

  async getHealthMemory(): Promise<
    RequestResponse<{ memory: Record<string, number> }>
  > {
    return request(this.app.getHttpServer()).get('/api/health/memory');
  }

  // Stats requests
  async getStats(token: string): Promise<RequestResponse<StatsResponse>> {
    return request(this.app.getHttpServer())
      .get('/api/stats')
      .set('Authorization', `Bearer ${token}`);
  }
}

// Helper function to create test client
export function createTestClient(app: INestApplication): TestClient {
  return new TestClient(app);
}

// Common test data factories
export const TestData = {
  createUser: (
    overrides: Partial<{
      email: string;
      password: string;
      name: string;
      isAdmin: boolean;
    }> = {},
  ) => ({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    isAdmin: false,
    ...overrides,
  }),

  createProduct: (overrides: Partial<ProductResponse> = {}) => ({
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test description',
    price: '1000000',
    discount: 0,
    quantity: 10,
    categoryId: '1',
    weight: 100,
    ...overrides,
  }),

  createOrder: (overrides: Partial<OrderResponse> = {}) => ({
    paymentMethod: 'cod',
    orderItems: [],
    ...overrides,
  }),

  createAddress: (overrides: Partial<AddressResponse> = {}) => ({
    fullName: 'Test User',
    phone: '1234567890',
    province: 'Ho Chi Minh',
    district: 'District 1',
    ward: 'Ben Nghe',
    address: '123 Test Street',
    country: 'Vietnam',
    isDefault: false,
    ...overrides,
  }),
};
