"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  image?: string | null;
  isAdmin?: boolean;
  bio?: string;
  phone?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    console.log('UserContext: Refreshing user data...');
    
    // Check for localStorage authentication (admin users)
    const authToken = localStorage.getItem('auth-token');
    const userData = localStorage.getItem('user');
    
    if (authToken && userData) {
      try {
        // Fetch fresh user data from backend for admin users
        const response = await fetch('http://localhost:8080/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const freshUserData = await response.json();
          setLocalUser(freshUserData);
          localStorage.setItem('user', JSON.stringify(freshUserData));
          console.log('UserContext: Updated local user data:', freshUserData);
        } else {
          // Fallback to localStorage data
          const user = JSON.parse(userData);
          setLocalUser(user);
          console.log('UserContext: Using fallback localStorage data:', user);
        }
      } catch (error) {
        console.error('UserContext: Error fetching fresh user data:', error);
        // Fallback to localStorage data
        const user = JSON.parse(userData);
        setLocalUser(user);
      }
    } else if (session?.user) {
      // For NextAuth users, fetch complete profile data
      try {
        const response = await fetch('/api/profile');
        
        if (response.ok) {
          const completeUserData = await response.json();
          setLocalUser(completeUserData);
          console.log('UserContext: Updated NextAuth user data:', completeUserData);
        } else {
          // Fallback to session data
          console.log('UserContext: Using fallback session data for NextAuth user');
        }
      } catch (error) {
        console.error('UserContext: Error fetching NextAuth user data:', error);
        // Fallback to session data
      }
    } else {
      setLocalUser(null);
    }
  }, [session]);

  // Initial load and when session changes
  useEffect(() => {
    refreshUser();
  }, [session, refreshUser]);

  // Listen for avatar updates and update local state directly
  useEffect(() => {
    const handleAvatarUpdate = () => {
      console.log('UserContext: Avatar update detected - updating from localStorage');
      // Update from localStorage instead of making API call
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setLocalUser(user);
        console.log('UserContext: Updated from localStorage:', user);
      }
    };

    window.addEventListener('avatar-updated', handleAvatarUpdate);
    
    return () => {
      window.removeEventListener('avatar-updated', handleAvatarUpdate);
    };
  }, []);

  // Determine which user data to use
  // Prioritize localUser if it has more complete data (like avatar)
  const user = localUser || (session?.user ? {
    id: session.user.id || '',
    name: session.user.name,
    email: session.user.email,
    avatar: (session.user as any).avatar,
    image: session.user.image,
    isAdmin: (session.user as any).isAdmin,
    bio: (session.user as any).bio,
    phone: (session.user as any).phone,
  } : null);



  // Set loading state
  useEffect(() => {
    setIsLoading(status === 'loading');
  }, [status]);

  const value = {
    user,
    isLoading,
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