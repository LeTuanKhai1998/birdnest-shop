import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Helper function to get authenticated headers
async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await getSession();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add JWT token from session
  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  return headers;
}

// Generic API call function with authentication
export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = await getAuthHeaders();
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> || {}),
    },
  });
}

// Convenience methods for common HTTP verbs
export const api = {
  get: (endpoint: string, options?: RequestInit) => 
    apiCall(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint: string, data?: Record<string, unknown>, options?: RequestInit) => 
    apiCall(endpoint, { 
      ...options, 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    }),
  
  put: (endpoint: string, data?: Record<string, unknown>, options?: RequestInit) => 
    apiCall(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined 
    }),
  
  patch: (endpoint: string, data?: Record<string, unknown>, options?: RequestInit) => 
    apiCall(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined 
    }),
  
  delete: (endpoint: string, data?: Record<string, unknown>, options?: RequestInit) => 
    apiCall(endpoint, { 
      ...options, 
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined 
    }),
};

// Legacy functions for backward compatibility
export async function fetchProducts(filters?: Record<string, unknown>) {
  try {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function fetchProductBySlug(slug: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/slug/${slug}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function fetchCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/products/categories`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function fetchUserProfile() {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function updateUserProfile(profileData: Record<string, unknown>) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function fetchUserOrders() {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function fetchUserAddresses() {
  try {
    const response = await fetch(`${API_BASE_URL}/addresses`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch addresses');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return [];
  }
}

export async function createUserAddress(addressData: Record<string, unknown>) {
  try {
    const response = await fetch(`${API_BASE_URL}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create address');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating address:', error);
    throw error;
  }
}

export async function updateUserAddress(id: string, addressData: Record<string, unknown>) {
  try {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update address');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
}

export async function deleteUserAddress(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete address');
    }

    return true;
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
}

export async function fetchUserWishlist() {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch wishlist');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
}

export async function addToWishlist(productId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add to wishlist');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
}

export async function removeFromWishlist(productId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove from wishlist');
    }

    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
}

export async function fetchUserNotifications() {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function fetchUnreadNotificationCount() {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }

    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to mark as read');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error marking as read:', error);
    throw error;
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to mark all as read');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
}

export async function deleteNotification(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete notification');
    }

    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

// API Service object with all required methods
export const apiService = {
  // Product methods
  getProducts: async (filters?: Record<string, unknown>) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });
      }

      const response = await api.get(`/products?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  getProductBySlug: async (slug: string) => {
    try {
      const response = await api.get(`/products/slug/${slug}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  getProduct: async (productId: string) => {
    try {
      const response = await api.get(`/products/${productId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  getProductStats: async () => {
    try {
      const response = await api.get('/products/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch product stats');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product stats:', error);
      return {
        totalProducts: 0,
        activeProducts: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: '0',
        averagePrice: '0',
        totalProductsTrend: 0,
        totalValueTrend: 0,
      };
    }
  },



  getCategories: async () => {
    try {
      const response = await api.get('/products/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  updateCategoryColor: async (categoryId: string, colorScheme: string | null) => {
    try {
      const response = await api.patch(`/products/categories/${categoryId}/color`, { colorScheme });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update category color');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating category color:', error);
      throw error;
    }
  },

  // Order methods
  getOrders: async () => {
    try {
      const response = await api.get('/orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  getOrderStats: async () => {
    try {
      const response = await api.get('/orders/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch order stats');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        ordersByStatus: []
      };
    }
  },

  getMyOrders: async () => {
    try {
      const response = await api.get('/orders/my-orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  getOrder: async (orderId: string) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please log in to view order details');
        } else if (response.status === 404) {
          throw new Error('Order not found');
        } else {
          throw new Error('Failed to fetch order');
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error; // Re-throw the error instead of returning null
    }
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update order status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // User methods
  getUsers: async () => {
    try {
      const response = await api.get('/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  createUser: async (userData: Record<string, unknown>) => {
    try {
      const response = await api.post('/users', userData);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (userId: string, userData: Record<string, unknown>) => {
    try {
      const response = await api.patch(`/users/${userId}`, userData);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (userId: string) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Product management methods (for admin)
  createProduct: async (productData: Record<string, unknown>) => {
    try {
      const response = await api.post('/products', productData);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create product');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (productId: string, productData: Record<string, unknown>) => {
    try {
      const response = await api.patch(`/products/${productId}`, productData);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update product');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (productId: string) => {
    try {
      const response = await api.delete(`/products/${productId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete product');
      }

      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Settings methods
  getSettings: async () => {
    try {
      const response = await api.get('/settings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return {};
    }
  },

  updateSettings: async (settingsData: Record<string, unknown>) => {
    try {
      const response = await api.patch('/settings', settingsData);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update settings');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  // Dashboard methods
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Review methods
  getProductReviews: async (productId: string) => {
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product reviews');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return [];
    }
  },

  createReview: async (reviewData: { productId: string; rating: number; comment?: string }) => {
    try {
      const response = await api.post('/reviews', reviewData);
      
      if (!response.ok) {
        const error = await response.json();
        // Handle specific error cases
        if (response.status === 409) {
          throw new Error('User has already reviewed this product');
        }
        // Handle other error responses
        if (error && error.message) {
          throw new Error(error.message);
        }
        throw new Error(error.message || 'Failed to create review');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  getUserReviews: async (userId: string) => {
    try {
      const response = await api.get(`/reviews/user/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        
        if (response.status === 401) {
          throw new Error('Authentication required to fetch user reviews');
        } else if (response.status === 403) {
          throw new Error('Unauthorized to access user reviews');
        } else if (response.status === 404) {
          throw new Error('User not found');
        } else {
          throw new Error(`Failed to fetch user reviews: ${errorMessage}`);
        }
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      // Return empty array instead of throwing to prevent page crashes
      return [];
    }
  },

  updateReview: async (reviewId: string, updateData: { rating?: number; comment?: string }) => {
    try {
      const response = await api.patch(`/reviews/${reviewId}`, updateData);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update review');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  updateReviewComment: async (reviewId: string, comment: string) => {
    try {
      const response = await api.put(`/reviews/${reviewId}/comment`, { comment });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update review comment');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating review comment:', error);
      throw error;
    }
  },
};
