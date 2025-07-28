"use client";

import { useState, useEffect } from 'react';

export function useHydrationSafe() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Small delay to ensure DOM is fully ready
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return { isHydrated, isClient };
}

// Utility function to safely render content only after hydration
export function HydrationSafeContent({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  const { isHydrated } = useHydrationSafe();
  
  if (!isHydrated) {
    return fallback;
  }
  
  return children;
} 