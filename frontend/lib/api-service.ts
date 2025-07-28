import { apiClient, getAuthHeaders } from './api-config';

// Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  quantity: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: {
    id?: string; // Make id optional for create/update operations
    url: string;
    isPrimary: boolean;
  }[];
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  total: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: 'COD' | 'BANK_TRANSFER' | 'STRIPE' | 'MOMO' | 'VNPAY';
  shippingAddress: string;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  productId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

// Products API
export const productsApi = {
  // Get all products with filters
  async getProducts(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.minPrice) searchParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());

    const query = searchParams.toString();
    return apiClient.get(`/products${query ? `?${query}` : ''}`);
  },

  // Get single product
  async getProduct(id: string) {
    return apiClient.get(`/products/${id}`);
  },

  // Get categories
  async getCategories() {
    return apiClient.get('/categories');
  },

  // Create product (admin only)
  async createProduct(data: Partial<Product>) {
    return apiClient.post('/products', data);
  },

  // Update product (admin only)
  async updateProduct(id: string, data: Partial<Product>) {
    return apiClient.put(`/products/${id}`, data);
  },

  // Delete product (admin only)
  async deleteProduct(id: string) {
    return apiClient.delete(`/products/${id}`);
  },

  // Create category (admin only)
  async createCategory(data: Partial<Category>) {
    return apiClient.post('/categories', data);
  },
};

// Orders API
export const ordersApi = {
  // Get orders (admin gets all, user gets their own)
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);

    const query = searchParams.toString();
    return apiClient.get(`/orders${query ? `?${query}` : ''}`);
  },

  // Get single order
  async getOrder(id: string) {
    return apiClient.get(`/orders/${id}`);
  },

  // Create order
  async createOrder(data: {
    items: Array<{
      productId: string;
      quantity: number;
    }>;
    shippingAddress: string;
    paymentMethod: Order['paymentMethod'];
  }) {
    return apiClient.post('/orders', data);
  },

  // Update order status (admin only)
  async updateOrderStatus(id: string, status: Order['status']) {
    return apiClient.put(`/orders/${id}/status`, { status });
  },

  // Delete order (admin only)
  async deleteOrder(id: string) {
    return apiClient.delete(`/orders/${id}`);
  },

  // Get order statistics (admin only)
  async getOrderStats(period?: string) {
    const query = period ? `?period=${period}` : '';
    return apiClient.get(`/orders/stats${query}`);
  },
};

// Cart API
export const cartApi = {
  // Get cart items
  async getCartItems() {
    return apiClient.get('/cart');
  },

  // Add item to cart
  async addToCart(data: {
    productId: string;
    quantity: number;
  }) {
    return apiClient.post('/cart', data);
  },

  // Update cart item
  async updateCartItem(id: string, data: { quantity: number }) {
    return apiClient.put(`/cart/${id}`, data);
  },

  // Remove item from cart
  async removeFromCart(id: string) {
    return apiClient.delete(`/cart/${id}`);
  },

  // Clear cart
  async clearCart() {
    return apiClient.delete('/cart');
  },
};

// Reviews API
export const reviewsApi = {
  // Get product reviews
  async getProductReviews(productId: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const query = searchParams.toString();
    return apiClient.get(`/products/${productId}/reviews${query ? `?${query}` : ''}`);
  },

  // Create review
  async createReview(productId: string, data: {
    rating: number;
    comment?: string;
  }) {
    return apiClient.post(`/products/${productId}/reviews`, data);
  },

  // Update review
  async updateReview(id: string, data: {
    rating: number;
    comment?: string;
  }) {
    return apiClient.put(`/reviews/${id}`, data);
  },

  // Delete review
  async deleteReview(id: string) {
    return apiClient.delete(`/reviews/${id}`);
  },

  // Get user reviews
  async getUserReviews(params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const query = searchParams.toString();
    return apiClient.get(`/reviews${query ? `?${query}` : ''}`);
  },
};

// Auth API
export const authApi = {
  // Register user
  async register(data: {
    name: string;
    email: string;
    password: string;
  }) {
    return apiClient.post('/auth/register', data);
  },

  // Login user
  async login(data: {
    email: string;
    password: string;
  }) {
    return apiClient.post('/auth/login', data);
  },

  // Logout user
  async logout(data: { refreshToken: string }) {
    return apiClient.post('/auth/logout', data);
  },

  // Refresh tokens
  async refreshTokens(data: { refreshToken: string }) {
    return apiClient.post('/auth/refresh-tokens', data);
  },

  // Forgot password
  async forgotPassword(data: { email: string }) {
    return apiClient.post('/auth/forgot-password', data);
  },

  // Reset password
  async resetPassword(token: string, data: { password: string }) {
    return apiClient.post(`/auth/reset-password?token=${token}`, data);
  },
};

// Dashboard API (admin only)
export const dashboardApi = {
  // Get dashboard statistics
  async getDashboardStats() {
    return apiClient.get('/dashboard/stats');
  },

  // Get revenue data
  async getRevenueData(period?: string) {
    const query = period ? `?period=${period}` : '';
    return apiClient.get(`/dashboard/revenue${query}`);
  },

  // Get order statistics
  async getOrderStats(period?: string) {
    const query = period ? `?period=${period}` : '';
    return apiClient.get(`/dashboard/orders${query}`);
  },

  // Get customer statistics
  async getCustomerStats(period?: string) {
    const query = period ? `?period=${period}` : '';
    return apiClient.get(`/dashboard/customers${query}`);
  },

  // Get product statistics
  async getProductStats(period?: string) {
    const query = period ? `?period=${period}` : '';
    return apiClient.get(`/dashboard/products${query}`);
  },
}; 