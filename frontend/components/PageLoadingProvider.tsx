'use client';

import { ReactNode } from 'react';
import { usePageLoading } from '@/hooks/usePageLoading';

interface PageLoadingProviderProps {
  children: ReactNode;
}

export function PageLoadingProvider({ children }: PageLoadingProviderProps) {
  // Use the page loading hook
  usePageLoading();

  return <>{children}</>;
} 