import { getSession } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const session = await getSession();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Add Authorization header if we have an access token
  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  return fetch(url, {
    ...options,
    headers,
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
}

export async function fetchProductBySlug(slug: string) {
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
}

export async function fetchCategories() {
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
}

export async function fetchUserProfile() {
  try {
    const response = await api.get('/users/profile');
    
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
    const response = await api.patch('/users/profile', profileData);
    
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
}

export async function fetchUserAddresses() {
  try {
    const response = await api.get('/addresses');
    
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
    const response = await api.post('/addresses', addressData);
    
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
    const response = await api.patch('/addresses', { id, ...addressData });
    
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
    const response = await api.delete(`/addresses?id=${id}`);
    
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
    const response = await api.get('/wishlist');
    
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
    const response = await api.post('/wishlist', { productId });
    
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
    const response = await api.delete('/wishlist', { productId });
    
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
    const response = await api.get('/notifications');
    
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
    const response = await api.get('/notifications/unread-count');
    
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
    const response = await api.patch(`/notifications/${id}/read`);
    
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
    const response = await api.patch('/notifications/read-all');
    
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
    const response = await api.delete(`/notifications/${id}`);
    
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