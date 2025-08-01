import { INestApplication } from '@nestjs/common';

// Test response interfaces
export interface TestResponse<T = unknown> {
  status: number;
  body: T;
  headers: Record<string, string>;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    isAdmin: boolean;
  };
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  bio?: string;
  avatar?: string;
  phone?: string;
}

export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  discount: number;
  quantity: number;
  categoryId: string;
  weight: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  images?: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
  }>;
}

export interface OrderResponse {
  id: string;
  userId?: string;
  status: string;
  paymentMethod: string;
  orderItems: Array<{
    id: string;
    productId: string;
    quantity: number;
    product: ProductResponse;
  }>;
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddressResponse {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  apartment?: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  id: string;
  title: string;
  body?: string;
  type: string;
  recipientType: string;
  userId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsResponse {
  store_name: string;
  store_email: string;
  default_language: string;
  currency: string;
  tax_percent: number;
  free_shipping_threshold: number;
  enable_stripe: boolean;
  enable_momo: boolean;
  enable_cod: boolean;
  maintenance_mode: boolean;
}

export interface StatsResponse {
  totalUsers?: number;
  adminUsers?: number;
  regularUsers?: number;
  newUsersThisMonth?: number;
  totalOrders?: number;
  totalRevenue?: number;
  ordersByStatus?: Record<string, number>;
  count?: number;
}

// Test app type
export type TestApp = INestApplication;

// Helper type for request responses
export type RequestResponse<T = unknown> = {
  status: number;
  body: T;
  headers: Record<string, string>;
};
