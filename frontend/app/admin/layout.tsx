'use client';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Customers', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  // Check if we're on the login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Don't check authentication on login page
    if (isLoginPage) {
      setIsAuthenticated(true);
      return;
    }

    const checkAuth = () => {
      const token = localStorage.getItem('auth-token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        setIsAuthenticated(false);
        router.push('/admin/login');
        return;
      }

      try {
        const user = JSON.parse(userData);
        if (!user.isAdmin) {
          setIsAuthenticated(false);
          router.push('/admin/login');
          return;
        }
        
        setUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router, isLoginPage]);

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  // Show loading while checking authentication (except on login page)
  if (isAuthenticated === null && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
    );
  }

  // Don't render layout if not authenticated (except on login page)
  if (!isAuthenticated && !isLoginPage) {
    return null;
  }

  // On login page, just render children without admin layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-neutral-900">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-neutral-800 border-r border-gray-200 dark:border-neutral-700 py-6 px-4 gap-4 sticky top-0 h-screen z-20">
        <div className="mb-8 flex items-center gap-2 text-2xl font-bold text-red-700">
          <span>Admin</span>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium hover:bg-red-50 dark:hover:bg-neutral-700 transition',
                'text-gray-700 dark:text-gray-200',
              )}
            >
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-2">
          {/* User info */}
          <div className="flex-1 text-sm text-gray-600 dark:text-gray-400">
            {user?.name || user?.email}
          </div>
          {/* Theme toggle placeholder */}
          <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 transition">
            <Sun className="w-5 h-5 hidden dark:inline" />
            <Moon className="w-5 h-5 dark:hidden" />
          </button>
          {/* Logout button */}
          <button 
            onClick={handleLogout}
            className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900 transition text-red-600"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 bg-gray-50 dark:bg-neutral-900 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
