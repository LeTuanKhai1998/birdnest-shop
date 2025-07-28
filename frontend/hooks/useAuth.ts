'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { setStoredToken, removeStoredToken } from '@/lib/api-config';

export const useAuth = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Store backend token in localStorage when session changes
    if (session && (session as any).backendToken) {
      setStoredToken((session as any).backendToken);
      // Also store refresh token
      if ((session as any).refreshToken) {
        localStorage.setItem('birdnest_refresh_token', (session as any).refreshToken);
      }
    } else if (status === 'unauthenticated') {
      // Clear tokens when user is not authenticated
      removeStoredToken();
      localStorage.removeItem('birdnest_refresh_token');
    }
  }, [session, status]);

  return {
    session,
    status,
    isAuthenticated: status === 'authenticated',
    isAdmin: session?.user?.isAdmin || false,
    user: session?.user,
    backendToken: (session as any)?.backendToken,
  };
}; 