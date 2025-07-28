import jwt from "jsonwebtoken";

export interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  code: number;
  status: string;
  message: string;
  user?: User;
  tokens?: {
    access: {
      token: string;
      expires: string;
    };
    refresh: {
      token: string;
      expires: string;
    };
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

class AuthService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';
  private tokenKey = 'birdnest_token';

  // Get stored token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  // Set token in localStorage
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.tokenKey, token);
  }

  // Remove token from localStorage
  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.tokenKey);
  }

  // Get current user from token
  getCurrentUser(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwt.decode(token) as any;
      return {
        id: decoded.sub, // JWT subject is user ID
        email: decoded.email || '',
        name: decoded.name || '',
        isAdmin: decoded.is_admin || false,
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      this.removeToken();
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwt.decode(token) as any;
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Error checking token validity:', error);
      this.removeToken();
      return false;
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.code === 200 && data.tokens?.access?.token) {
        this.setToken(data.tokens.access.token);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        code: 500,
        status: 'error',
        message: 'Network error occurred',
      };
    }
  }

  // Register user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.code === 200 && data.tokens?.access?.token) {
        this.setToken(data.tokens.access.token);
      }

      return data;
    } catch (error) {
      console.error('Register error:', error);
      return {
        code: 500,
        status: 'error',
        message: 'Network error occurred',
      };
    }
  }

  // Logout user
  logout(): void {
    this.removeToken();
  }

  // Get authenticated request headers
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Make authenticated API request
  async authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = this.getAuthHeaders();
    return fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
  }
}

export const authService = new AuthService(); 