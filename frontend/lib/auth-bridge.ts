import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const useAuthBridge = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    const syncJWTToken = async () => {
      if (status === 'authenticated' && session?.user) {
        try {
          // Check if we already have a valid token
          const existingToken = localStorage.getItem('auth-token');
          if (existingToken) {
            // Verify token is still valid by making a test request
            const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
              headers: {
                'Authorization': `Bearer ${existingToken}`,
              },
            });
            
            if (response.ok) {
              // Token is still valid, no need to refresh
              return;
            }
          }

          // Get JWT token from backend using NextAuth session
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: session.user.email,
              password: 'temp-password', // This won't work with real auth
            }),
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('auth-token', data.access_token);
          } else {
            // If login fails, try to register the user
            const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: session.user.email,
                password: 'temp-password-' + Date.now(), // Generate a temporary password
                name: session.user.name || 'User',
              }),
            });

            if (registerResponse.ok) {
              const data = await registerResponse.json();
              localStorage.setItem('auth-token', data.access_token);
            }
          }
        } catch (error) {
          console.error('Failed to sync JWT token:', error);
        }
      } else if (status === 'unauthenticated') {
        // Clear token when user logs out
        localStorage.removeItem('auth-token');
      }
    };

    syncJWTToken();
  }, [status, session]);

  return { session, status };
}; 