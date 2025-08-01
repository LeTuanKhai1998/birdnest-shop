"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  isAdmin: boolean;
  role: string;
  createdAt: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    console.log('🔄 refreshUser called:', {
      sessionEmail: session?.user?.email,
      timestamp: new Date().toISOString()
    });

    if (!session?.user?.email) {
      console.log('❌ No session email, setting user to null');
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch user profile');
      
      // Fallback to session data if API fails
      if (session.user && session.user.email) {
        setUser({
          id: session.user.id || '',
          email: session.user.email,
          name: session.user.name || undefined,
          avatar: session.user.avatar || undefined,
          bio: session.user.bio || undefined,
          phone: session.user.phone || undefined,
          isAdmin: session.user.isAdmin || false,
          role: session.user.role || 'USER',
          createdAt: new Date().toISOString(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data when session changes
  useEffect(() => {
    console.log('🔄 UserContext useEffect triggered:', {
      sessionEmail: session?.user?.email,
      currentUser: user ? { id: user.id, email: user.email, isAdmin: user.isAdmin } : null,
      timestamp: new Date().toISOString()
    });
    refreshUser();
  }, [session?.user?.email]);

  const value: UserContextType = {
    user,
    loading,
    error,
    refreshUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 