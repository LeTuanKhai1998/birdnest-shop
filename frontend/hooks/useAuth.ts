import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';

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
  const { user: contextUser, isLoading: contextLoading } = useUser();
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

  // Prioritize UserContext data, then localStorage, then NextAuth session
  const user = contextUser || localUser || session?.user;
  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin || false;

  return {
    user: user as User | null,
    isLoading: isLoading || status === 'loading' || contextLoading,
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
    // Only redirect if we're not loading and definitely not authenticated/admin
    if (!isLoading && !isAuthenticated) {
      console.log('useRequireAdmin: Not authenticated, redirecting to:', redirectTo);
      window.location.href = redirectTo;
    } else if (!isLoading && isAuthenticated && !isAdmin) {
      console.log('useRequireAdmin: Authenticated but not admin, redirecting to:', redirectTo);
      window.location.href = redirectTo;
    }
  }, [isLoading, isAuthenticated, isAdmin, redirectTo]);

  return { user, isLoading, isAuthenticated, isAdmin };
} 