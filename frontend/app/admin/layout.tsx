'use client';
import Link from 'next/link';
import React, { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  Sun,
  Moon,
  Home as HomeIcon,
  Box,
  Info,
  Mail,
  Package,
  FileText,
  Shield,
  Star,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireAdmin } from '@/hooks/useAuth';

const navLinks = [
  { href: '/admin', label: 'Bảng điều khiển', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { href: '/admin/products', label: 'Sản phẩm', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Khách hàng', icon: Users },
  { href: '/admin/settings', label: 'Cài đặt', icon: Settings },
];

// Page configurations for hero banners
const pageConfigs = {
  '/admin': {
    title: 'Bảng Điều Khiển',
    description: 'Tổng quan hiệu suất và phân tích cửa hàng của bạn',
    icon: LayoutDashboard
  },
  '/admin/orders': {
    title: 'Quản Lý Đơn Hàng',
    description: 'Xem và quản lý tất cả đơn hàng của khách hàng',
    icon: ShoppingBag
  },
  '/admin/products': {
    title: 'Quản Lý Sản Phẩm',
    description: 'Thêm, chỉnh sửa và quản lý danh mục sản phẩm',
    icon: Box
  },
  '/admin/users': {
    title: 'Quản Lý Khách Hàng',
    description: 'Xem thông tin và quản lý tài khoản khách hàng',
    icon: Users
  },
  '/admin/settings': {
    title: 'Cài Đặt Hệ Thống',
    description: 'Cấu hình cửa hàng và tùy chọn hệ thống',
    icon: Settings
  }
};

const AdminLayout = React.memo(function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, isAdmin } = useRequireAdmin('/login?callbackUrl=/admin');

  // Get current page configuration
  const currentPageConfig = pageConfigs[pathname as keyof typeof pageConfigs];
  const IconComponent = currentPageConfig?.icon || LayoutDashboard;

  const handleLogout = () => {
    // Only use NextAuth signOut
    signOut({ callbackUrl: '/login' });
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
    );
  }

  // Don't render layout if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <div className="flex">
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
          
          {/* Main Navigation */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-neutral-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Điều hướng chính
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-neutral-700 transition text-gray-700 dark:text-gray-200"
              >
                <HomeIcon className="w-5 h-5" />
                <span>Trang chủ</span>
              </Link>
              <Link
                href="/products"
                className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-neutral-700 transition text-gray-700 dark:text-gray-200"
              >
                <Box className="w-5 h-5" />
                <span>Sản phẩm</span>
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-neutral-700 transition text-gray-700 dark:text-gray-200"
              >
                <Info className="w-5 h-5" />
                <span>Giới thiệu</span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-neutral-700 transition text-gray-700 dark:text-gray-200"
              >
                <Mail className="w-5 h-5" />
                <span>Liên hệ</span>
              </Link>
              <Link
                href="/guest-orders"
                className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-neutral-700 transition text-gray-700 dark:text-gray-200"
              >
                <Package className="w-5 h-5" />
                <span>Tra đơn</span>
              </Link>
            </nav>
          </div>
          
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
          <main className="flex-1 max-w-7xl mx-auto w-full">
            {/* Hero Section - Only show for admin pages */}
            {currentPageConfig && (
              <div className="bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white py-12">
                <div className="container mx-auto px-4 text-center">
                  <div className="mb-6">
                    <IconComponent className="w-16 h-16 mx-auto" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {currentPageConfig.title}
                  </h1>
                  <p className="text-lg text-red-100">
                    {currentPageConfig.description}
                  </p>
                </div>
              </div>
            )}

            {/* Page Content */}
            <div className="container mx-auto px-4 py-12 max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
});

export default AdminLayout;
