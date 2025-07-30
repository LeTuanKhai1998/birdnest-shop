// Product types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  discount: number;
  quantity: number;
  weight: number;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
  image?: string;
  images: ProductImage[];
  reviews?: Review[];
  _count: {
    reviews: number;
  };
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  productId: string;
  createdAt: string;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: string;
  items: OrderItem[];
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: string;
  product?: Product;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  userId: string;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// API request types
export interface ProductsParams {
  skip?: number;
  take?: number;
  categoryId?: string;
  search?: string;
}

export interface OrdersParams {
  skip?: number;
  take?: number;
  userId?: string;
  status?: string;
}

export interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: Omit<Address, 'id' | 'userId'>;
}

export interface UpdateOrderStatusData {
  status: OrderStatus;
}

export interface UpdateUserAdminData {
  isAdmin: boolean;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
  hasMore: boolean;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: string;
  averageOrderValue: string;
  ordersByStatus: Record<OrderStatus, number>;
}

// Settings types
export interface SettingsData {
  storeName: string;
  storeEmail: string;
  storePhone?: string;
  defaultLanguage: 'en' | 'vi';
  currency: string;
  taxPercent: number;
  freeShippingThreshold: number;
  enableStripe: boolean;
  enableMomo: boolean;
  enableCOD: boolean;
  maintenanceMode: boolean;
  logoUrl?: string;
  address?: string;
  country?: string;
}
