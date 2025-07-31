'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

export interface Notification {
  id: string;
  title: string;
  body?: string;
  type: 'ORDER' | 'STOCK' | 'PAYMENT' | 'SYSTEM' | 'PROMOTION';
  recipientType: 'ADMIN' | 'USER';
  userId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if we're on a page where notifications should be disabled
  const isNotificationDisabled = () => {
    if (typeof window === 'undefined') return false;
    
    // Disable notifications on login pages and other auth pages
    const currentPath = window.location.pathname;
    const disabledPaths = [
              '/login?callbackUrl=/admin',
      '/login',
      '/signup',
      '/auth',
      '/unauthorized'
    ];
    
    return disabledPaths.some(path => currentPath.startsWith(path));
  };

  const fetchNotifications = async () => {
    if (!session?.user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get JWT token from localStorage (for admin users)
      const token = localStorage.getItem('auth-token');
      
      if (token) {
        // For admin users, use backend API directly
        const response = await fetch('http://localhost:8080/api/notifications', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        
        const data = await response.json();
        setNotifications(data);
      } else {
        // For NextAuth users, use frontend API route
        const response = await fetch('/api/notifications');
        
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        } else {
          // Return empty array if no notifications found
          setNotifications([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUnreadCount = async () => {
    if (!session?.user) return;
    
    try {
      // Get JWT token from localStorage (for admin users)
      const token = localStorage.getItem('auth-token');
      
      if (token) {
        // For admin users, use backend API directly
        const response = await fetch('http://localhost:8080/api/notifications/unread-count', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data);
        }
      } else {
        // For NextAuth users, use frontend API route
        const response = await fetch('/api/notifications/unread-count');
        
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data);
        } else {
          setUnreadCount(0);
        }
      }
    } catch (err) {
      // Don't log error for unread count, it's not critical
      console.log('Failed to fetch unread count (non-critical):', err);
    }
  };

  const markAsRead = async (id: string) => {
    if (!session?.user) return;
    
    try {
      // Get JWT token from localStorage (for admin users)
      const token = localStorage.getItem('auth-token');
      
      if (token) {
        // For admin users, use backend API directly
        const response = await fetch(`http://localhost:8080/api/notifications/${id}/read`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          setNotifications(prev => 
            prev.map(notification => 
              notification.id === id 
                ? { ...notification, isRead: true }
                : notification
            )
          );
          await refreshUnreadCount();
        }
      } else {
        // For NextAuth users, use frontend API route
        const response = await fetch(`/api/notifications/${id}/read`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          setNotifications(prev => 
            prev.map(notification => 
              notification.id === id 
                ? { ...notification, isRead: true }
                : notification
            )
          );
          await refreshUnreadCount();
        }
      }
    } catch (err) {
      console.log('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!session?.user) return;
    
    try {
      // Get JWT token from localStorage (for admin users)
      const token = localStorage.getItem('auth-token');
      
      if (token) {
        // For admin users, use backend API directly
        const response = await fetch('http://localhost:8080/api/notifications/read-all', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          setNotifications(prev => 
            prev.map(notification => ({ ...notification, isRead: true }))
          );
          setUnreadCount(0);
        }
      } else {
        // For NextAuth users, use frontend API route
        const response = await fetch('/api/notifications/read-all', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          setNotifications(prev => 
            prev.map(notification => ({ ...notification, isRead: true }))
          );
          setUnreadCount(0);
        }
      }
    } catch (err) {
      console.log('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!session?.user) return;
    
    try {
      // Get JWT token from localStorage (for admin users)
      const token = localStorage.getItem('auth-token');
      
      if (token) {
        // For admin users, use backend API directly
        const response = await fetch(`http://localhost:8080/api/notifications/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          setNotifications(prev => prev.filter(notification => notification.id !== id));
          await refreshUnreadCount();
        }
      } else {
        // For NextAuth users, use frontend API route
        const response = await fetch(`/api/notifications/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          setNotifications(prev => prev.filter(notification => notification.id !== id));
          await refreshUnreadCount();
        }
      }
    } catch (err) {
      console.log('Failed to delete notification:', err);
    }
  };

  // Fetch notifications when session changes
  useEffect(() => {
    // Don't fetch notifications on login pages
    if (isNotificationDisabled()) return;
    
    // Fetch if we have a session (works for both JWT and NextAuth users)
    if (status === 'authenticated' && session?.user) {
      fetchNotifications();
      refreshUnreadCount();
    }
  }, [status, session]);

  // Set up polling for new notifications (every 30 seconds)
  useEffect(() => {
    // Don't poll notifications on login pages
    if (isNotificationDisabled()) return;
    
    // Poll if we have a session (works for both JWT and NextAuth users)
    if (status !== 'authenticated' || !session?.user) return;

    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [status, session]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 