const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(response.status, errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: (endpoint: string) => apiRequest(endpoint),
  post: (endpoint: string, data?: any) => apiRequest(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  }),
  put: (endpoint: string, data?: any) => apiRequest(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  }),
  patch: (endpoint: string, data?: any) => apiRequest(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  }),
  delete: (endpoint: string) => apiRequest(endpoint, {
    method: 'DELETE',
  }),
}; 