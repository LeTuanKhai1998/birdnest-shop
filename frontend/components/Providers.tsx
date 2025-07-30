'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { NotificationProvider } from '@/lib/notification-context';
import { Toaster } from 'sonner';
import { PageLoadingProvider } from '@/components/PageLoadingProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <PageLoadingProvider>
          {children}
          <Toaster position="top-right" richColors />
        </PageLoadingProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}
