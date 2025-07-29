import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components
export const LazyAdminDashboard = dynamic(
  () => import('@/app/admin/page'),
  {
    loading: () => <AdminDashboardSkeleton />,
    ssr: false,
  }
);

export const LazyAdminProducts = dynamic(
  () => import('@/app/admin/products/page'),
  {
    loading: () => <AdminProductsSkeleton />,
    ssr: false,
  }
);

export const LazyAdminOrders = dynamic(
  () => import('@/app/admin/orders/page'),
  {
    loading: () => <AdminOrdersSkeleton />,
    ssr: false,
  }
);

export const LazyAdminUsers = dynamic(
  () => import('@/app/admin/users/page'),
  {
    loading: () => <AdminUsersSkeleton />,
    ssr: false,
  }
);

// Lazy load charts and heavy UI components
export const LazyCharts = dynamic(
  () => import('@/components/Charts'),
  {
    loading: () => <ChartsSkeleton />,
    ssr: false,
  }
);

// Skeleton components for loading states
function AdminDashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

function AdminProductsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-16 w-full" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}

function AdminOrdersSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-16 w-full" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}

function AdminUsersSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-16 w-full" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="flex items-center justify-center h-80">
      <Skeleton className="h-64 w-full max-w-2xl" />
    </div>
  );
}

// Generic loading wrapper
export function LoadingWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      {children}
    </Suspense>
  );
} 