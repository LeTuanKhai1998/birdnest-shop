const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
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
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Products API
  async getProducts(params?: {
    skip?: number;
    take?: number;
    categoryId?: string;
    search?: string;
  }): Promise<any[]> {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.take) searchParams.append('take', params.take.toString());
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId);
    if (params?.search) searchParams.append('search', params.search);
    
    const query = searchParams.toString();
    return this.request<any[]>(`/products${query ? `?${query}` : ''}`);
  }

  async getProduct(id: string): Promise<any> {
    return this.request<any>(`/products/${id}`);
  }

  async getProductBySlug(slug: string): Promise<any> {
    return this.request<any>(`/products/slug/${slug}`);
  }

  async getCategories(): Promise<any[]> {
    return this.request<any[]>(`/products/categories`);
  }

  // Orders API
  async getOrders(params?: {
    skip?: number;
    take?: number;
    userId?: string;
    status?: string;
  }): Promise<any[]> {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.take) searchParams.append('take', params.take.toString());
    if (params?.userId) searchParams.append('userId', params.userId);
    if (params?.status) searchParams.append('status', params.status);
    
    const query = searchParams.toString();
    return this.request<any[]>(`/orders${query ? `?${query}` : ''}`);
  }

  async getOrder(id: string): Promise<any> {
    return this.request<any>(`/orders/${id}`);
  }

  async getOrderStats(): Promise<any> {
    return this.request<any>(`/orders/stats`);
  }

  async createOrder(data: any): Promise<any> {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrderStatus(id: string, status: string): Promise<any> {
    return this.request<any>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Users API
  async getUsers(): Promise<any[]> {
    return this.request<any[]>('/users');
  }

  async getUser(id: string): Promise<any> {
    return this.request<any>(`/users/${id}`);
  }

  async updateUserAdminStatus(id: string, isAdmin: boolean): Promise<any> {
    return this.request<any>(`/users/${id}/admin`, {
      method: 'PUT',
      body: JSON.stringify({ isAdmin }),
    });
  }
}

export const apiService = new ApiService(); 