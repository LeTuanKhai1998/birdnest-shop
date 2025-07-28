import { setStoredToken, removeStoredToken, getStoredToken } from './api-config';

// Types
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

export interface LoginCredentials {
  email: string;
  password: string;
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

class AuthService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';

  // Get stored token
  getToken(): string | null {
    return getStoredToken();
  }

  // Set token
  setToken(token: string): void {
    setStoredToken(token);
  }

  // Remove token
  removeToken(): void {
    removeStoredToken();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get current user from token
  getCurrentUser(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        email: payload.email || '',
        name: payload.name,
        phone: payload.phone,
        address: payload.address,
        isAdmin: payload.isAdmin || false,
        createdAt: new Date(payload.iat * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
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

      if (response.ok && data.tokens?.access?.token) {
        this.setToken(data.tokens.access.token);
        // Store refresh token for future use
        if (data.tokens.refresh?.token) {
          localStorage.setItem('birdnest_refresh_token', data.tokens.refresh.token);
        }
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
  async register(userData: { email: string; password: string; name?: string; phone?: string }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.tokens?.access?.token) {
        this.setToken(data.tokens.access.token);
        // Store refresh token for future use
        if (data.tokens.refresh?.token) {
          localStorage.setItem('birdnest_refresh_token', data.tokens.refresh.token);
        }
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
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('birdnest_refresh_token');
      if (refreshToken) {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeToken();
      localStorage.removeItem('birdnest_refresh_token');
    }
  }

  // Refresh token
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('birdnest_refresh_token');
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.tokens?.access?.token) {
          this.setToken(data.tokens.access.token);
          if (data.tokens.refresh?.token) {
            localStorage.setItem('birdnest_refresh_token', data.tokens.refresh.token);
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      return await response.json();
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        code: 500,
        status: 'error',
        message: 'Network error occurred',
      };
    }
  }

  // Reset password
  async resetPassword(token: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      return await response.json();
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        code: 500,
        status: 'error',
        message: 'Network error occurred',
      };
    }
  }
}

export const authService = new AuthService(); 