import { authService } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  session?: any
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get auth headers from auth service, with session if provided
  const authHeaders = session ? authService.getAuthHeadersWithSession(session) : authService.getAuthHeaders();
  
  console.log("🌐 API Request:", {
    url,
    method: options.method || 'GET',
    session: session ? { hasBackendToken: !!session.backendToken, userId: session.user?.id } : 'No session',
    authHeaders: { ...authHeaders, Authorization: authHeaders.Authorization ? 'Bearer ***' : 'None' }
  });
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...authHeaders,
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  console.log("📡 API Response:", {
    status: response.status,
    statusText: response.statusText,
    url: response.url
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    console.error("❌ API Error:", errorData);
    throw new ApiError(response.status, errorData.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  console.log("✅ API Success:", data);
  return data;
}

export const api = {
  get: (endpoint: string, session?: any) => apiRequest(endpoint, {}, session),
  post: (endpoint: string, data?: any, session?: any) => apiRequest(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  }, session),
  put: (endpoint: string, data?: any, session?: any) => apiRequest(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  }, session),
  patch: (endpoint: string, data?: any, session?: any) => apiRequest(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  }, session),
  delete: (endpoint: string, session?: any) => apiRequest(endpoint, {
    method: 'DELETE',
  }, session),
}; 