import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const { user: contextUser, loading: contextLoading } = useUser();

  // Use UserContext data if available, otherwise fall back to session
  const user = contextUser || session?.user;
  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin || false;

  return {
    user: user as User | null,
    isLoading: status === 'loading' || contextLoading,
    isAuthenticated,
    isAdmin,
  };
}

export function useRequireAuth(redirectTo = '/login') {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, router]);

  return { user, isLoading, isAuthenticated };
}

export function useRequireAdmin(redirectTo = '/login') {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Only redirect if we're not loading and definitely not authenticated/admin
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    } else if (!isLoading && isAuthenticated && !isAdmin) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, isAdmin, redirectTo, router]);

  return { user, isLoading, isAuthenticated, isAdmin };
} 