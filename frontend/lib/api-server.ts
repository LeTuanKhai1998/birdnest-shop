import { auth } from '@/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Server-side helper function to get authenticated headers
async function getServerAuthHeaders(): Promise<Record<string, string>> {
  const session = await auth();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add JWT token from session
  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  return headers;
}

// Server-side API call function with authentication
export async function serverApiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = await getServerAuthHeaders();
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> || {}),
    },
  });
}

// Server-side convenience methods
export const serverApi = {
  get: (endpoint: string, options?: RequestInit) => 
    serverApiCall(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint: string, data?: Record<string, unknown>, options?: RequestInit) => 
    serverApiCall(endpoint, { 
      ...options, 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    }),
  
  put: (endpoint: string, data?: Record<string, unknown>, options?: RequestInit) => 
    serverApiCall(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined 
    }),
  
  patch: (endpoint: string, data?: Record<string, unknown>, options?: RequestInit) => 
    serverApiCall(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined 
    }),
  
  delete: (endpoint: string, data?: Record<string, unknown>, options?: RequestInit) => 
    serverApiCall(endpoint, { 
      ...options, 
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined 
    }),
};

// Server-side specific functions
export async function getProducts() {
  try {
    const response = await serverApi.get('/products');
    
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

export async function getProductBySlug(slug: string) {
  try {
    const response = await serverApi.get(`/products/slug/${slug}`);
    
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

export async function getCategories() {
  try {
    const response = await serverApi.get('/categories');
    
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