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

    const endpoint = `/products${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  // Get single product
  async getProduct(id: string) {
    return apiClient.get(`/products/${id}`);
  },

  // Get categories
  async getCategories() {
    return apiClient.get('/categories');
  },

  // Admin: Create product
  async createProduct(data: Partial<Product>, token: string) {
    return apiClient.post('/admin/products', data, {
      headers: getAuthHeaders(token),
    });
  },

  // Admin: Update product
  async updateProduct(id: string, data: Partial<Product>, token: string) {
    return apiClient.put(`/admin/products/${id}`, data, {
      headers: getAuthHeaders(token),
    });
  },

  // Admin: Delete product
  async deleteProduct(id: string, token: string) {
    return apiClient.delete(`/admin/products/${id}`, {
      headers: getAuthHeaders(token),
    });
  },

  // Admin: Create category
  async createCategory(data: Partial<Category>, token: string) {
    return apiClient.post('/admin/categories', data, {
      headers: getAuthHeaders(token),
    });
  },
};

// Orders API
export const ordersApi = {
  // Get user orders or all orders (admin)
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }, token?: string) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);

    const endpoint = `/orders${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiClient.get(endpoint, {
      headers: getAuthHeaders(token),
    });
  },

  // Get single order
  async getOrder(id: string, token?: string) {
    return apiClient.get(`/orders/${id}`, {
      headers: getAuthHeaders(token),
    });
  },

  // Create order
  async createOrder(data: {
    items: Array<{
      productId: string;
      quantity: number;
    }>;
    shippingAddress: string;
    paymentMethod: Order['paymentMethod'];
  }, token: string) {
    return apiClient.post('/orders', data, {
      headers: getAuthHeaders(token),
    });
  },

  // Admin: Update order status
  async updateOrderStatus(id: string, status: Order['status'], token: string) {
    return apiClient.put(`/admin/orders/${id}/status`, { status }, {
      headers: getAuthHeaders(token),
    });
  },

  // Admin: Delete order
  async deleteOrder(id: string, token: string) {
    return apiClient.delete(`/admin/orders/${id}`, {
      headers: getAuthHeaders(token),
    });
  },

  // Admin: Get order statistics
  async getOrderStats(period?: string, token?: string) {
    const endpoint = `/admin/orders/stats${period ? `?period=${period}` : ''}`;
    return apiClient.get(endpoint, {
      headers: getAuthHeaders(token),
    });
  },
};

// Cart API
export const cartApi = {
  // Get cart items
  async getCartItems(token: string) {
    return apiClient.get('/cart', {
      headers: getAuthHeaders(token),
    });
  },

  // Add item to cart
  async addToCart(data: {
    productId: string;
    quantity: number;
  }, token: string) {
    return apiClient.post('/cart', data, {
      headers: getAuthHeaders(token),
    });
  },

  // Update cart item
  async updateCartItem(id: string, data: { quantity: number }, token: string) {
    return apiClient.put(`/cart/${id}`, data, {
      headers: getAuthHeaders(token),
    });
  },

  // Remove item from cart
  async removeFromCart(id: string, token: string) {
    return apiClient.delete(`/cart/${id}`, {
      headers: getAuthHeaders(token),
    });
  },

  // Clear cart
  async clearCart(token: string) {
    return apiClient.delete('/cart', {
      headers: getAuthHeaders(token),
    });
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

    const endpoint = `/products/${productId}/reviews${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  // Create review
  async createReview(productId: string, data: {
    rating: number;
    comment?: string;
  }, token: string) {
    return apiClient.post(`/products/${productId}/reviews`, data, {
      headers: getAuthHeaders(token),
    });
  },

  // Update review
  async updateReview(id: string, data: {
    rating: number;
    comment?: string;
  }, token: string) {
    return apiClient.put(`/reviews/${id}`, data, {
      headers: getAuthHeaders(token),
    });
  },

  // Delete review
  async deleteReview(id: string, token: string) {
    return apiClient.delete(`/reviews/${id}`, {
      headers: getAuthHeaders(token),
    });
  },

  // Get user reviews
  async getUserReviews(params?: {
    page?: number;
    limit?: number;
  }, token?: string) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const endpoint = `/users/reviews${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiClient.get(endpoint, {
      headers: getAuthHeaders(token),
    });
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
    return apiClient.post('/auth/refresh', data);
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

// Dashboard API
export const dashboardApi = {
  // Get dashboard statistics
  async getDashboardStats(token?: string) {
    return apiClient.get('/dashboard/metrics', {
      headers: getAuthHeaders(token),
    });
  },

  // Get revenue data
  async getRevenueData(period?: string, token?: string) {
    const endpoint = `/dashboard/revenue-chart${period ? `?period=${period}` : ''}`;
    return apiClient.get(endpoint, {
      headers: getAuthHeaders(token),
    });
  },

  // Get order statistics
  async getOrderStats(period?: string, token?: string) {
    const endpoint = `/dashboard/order-statistics${period ? `?period=${period}` : ''}`;
    return apiClient.get(endpoint, {
      headers: getAuthHeaders(token),
    });
  },

  // Get customer statistics
  async getCustomerStats(period?: string, token?: string) {
    const endpoint = `/dashboard/customer-insights${period ? `?period=${period}` : ''}`;
    return apiClient.get(endpoint, {
      headers: getAuthHeaders(token),
    });
  },

  // Get product statistics
  async getProductStats(period?: string, token?: string) {
    const endpoint = `/dashboard/top-products${period ? `?limit=${period}` : ''}`;
    return apiClient.get(endpoint, {
      headers: getAuthHeaders(token),
    });
  },
}; 