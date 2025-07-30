import {
  Product,
  Category,
  Order,
  User,
  ProductsParams,
  OrdersParams,
  CreateOrderData,
  OrderStats,
  SettingsData,
} from './types';

// API payload types for create/update operations
interface CreateProductData {
  name: string;
  slug: string;
  description: string;
  price: string;
  quantity: number;
  categoryId: string;
  images?: Array<{
    url: string;
    isPrimary: boolean;
  }>;
}

interface UpdateProductData {
  name?: string;
  slug?: string;
  description?: string;
  price?: string;
  quantity?: number;
  categoryId?: string;
  images?: Array<{
    url: string;
    isPrimary: boolean;
  }>;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');
      if (token) {
        // Check if token is expired
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp < now) {
            console.log('JWT token expired, redirecting to login');
            localStorage.removeItem('auth-token');
            localStorage.removeItem('user');
            window.location.href = '/login?callbackUrl=/admin';
            throw new Error('Token expired');
          }
        } catch (error) {
          console.log('Invalid token format, redirecting to login');
          localStorage.removeItem('auth-token');
          localStorage.removeItem('user');
          window.location.href = '/login?callbackUrl=/admin';
          throw new Error('Invalid token');
        }
        
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        console.error(`API request failed: ${response.status} ${response.statusText}`);
        
        // If 401 Unauthorized, clear token and redirect to login
        if (response.status === 401) {
          console.log('401 Unauthorized - clearing token and redirecting to login');
          localStorage.removeItem('auth-token');
          localStorage.removeItem('user');
          window.location.href = '/login?callbackUrl=/admin';
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Products API
  async getProducts(params?: ProductsParams): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.take) searchParams.append('take', params.take.toString());
    if (params?.categoryId)
      searchParams.append('categoryId', params.categoryId);
    if (params?.search) searchParams.append('search', params.search);

    const query = searchParams.toString();
    return this.request<Product[]>(`/products${query ? `?${query}` : ''}`);
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async getProductBySlug(slug: string): Promise<Product> {
    return this.request<Product>(`/products/slug/${slug}`);
  }

  async createProduct(data: CreateProductData): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>(`/products/categories`);
  }

  // Orders API
  async getOrders(params?: OrdersParams): Promise<Order[]> {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.take) searchParams.append('take', params.take.toString());
    if (params?.userId) searchParams.append('userId', params.userId);
    if (params?.status) searchParams.append('status', params.status);

    const query = searchParams.toString();
    return this.request<Order[]>(`/orders${query ? `?${query}` : ''}`);
  }

  async getOrder(id: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  async getOrderStats(): Promise<OrderStats> {
    return this.request<OrderStats>(`/orders/stats`);
  }

  async createOrder(data: CreateOrderData): Promise<Order> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Users API
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async updateUserAdminStatus(id: string, isAdmin: boolean): Promise<User> {
    return this.request<User>(`/users/${id}/admin`, {
      method: 'PUT',
      body: JSON.stringify({ isAdmin }),
    });
  }

  // Auth API
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    return this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string): Promise<{ access_token: string; user: User }> {
    return this.request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  // Settings API
  async getSettings(): Promise<SettingsData> {
    return this.request<SettingsData>('/settings');
  }

  async updateSettings(data: Partial<SettingsData>): Promise<SettingsData> {
    return this.request<SettingsData>('/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
