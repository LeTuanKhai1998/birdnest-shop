import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function useAuth(): AuthState {
  const { data: session, status } = useSession();
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for admin users (legacy auth)
    const token = localStorage.getItem('auth-token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setLocalUser(user);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Use NextAuth session for regular users, localStorage for admin users
  const user = localUser || session?.user;
  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin || false;

  return {
    user: user as User | null,
    isLoading: isLoading || status === 'loading',
    isAuthenticated,
    isAdmin,
  };
}

export function useRequireAuth(redirectTo = '/login') {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [isLoading, isAuthenticated, redirectTo]);

  return { user, isLoading, isAuthenticated };
}

export function useRequireAdmin(redirectTo = '/login') {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      window.location.href = redirectTo;
    }
  }, [isLoading, isAuthenticated, isAdmin, redirectTo]);

  return { user, isLoading, isAuthenticated, isAdmin };
} 