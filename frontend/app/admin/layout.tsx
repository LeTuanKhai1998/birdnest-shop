'use client';
import Link from 'next/link';
import React, { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  Home as HomeIcon,
  Box,
  Info,
  Mail,
  Package,
  Menu,
  X,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireAdmin } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';

const navLinks = [
  { href: '/admin', label: 'Bảng điều khiển', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { href: '/admin/products', label: 'Sản phẩm', icon: Box },
  { href: '/admin/categories', label: 'Danh mục', icon: Tag },
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
  },
  '/admin/categories': {
    title: 'Quản Lý Danh Mục',
    description: 'Quản lý danh mục sản phẩm và màu sắc',
    icon: Tag
  }
};

const AdminLayout = React.memo(function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isLoading, isAuthenticated, isAdmin } = useRequireAdmin('/login?callbackUrl=/admin');
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Get current page configuration
  const currentPageConfig = pageConfigs[pathname as keyof typeof pageConfigs];
  const IconComponent = currentPageConfig?.icon || LayoutDashboard;



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
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          )}
        </button>

        {/* Sidebar */}
        <aside className={cn(
          "flex flex-col w-64 bg-white dark:bg-neutral-800 border-r border-gray-200 dark:border-neutral-700 py-6 px-4 gap-4 fixed top-0 left-0 h-screen z-20 overflow-y-auto transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <div className="mb-8 flex items-center gap-2 text-2xl font-bold text-red-700">
            <span>Admin</span>
          </div>
          <nav className="flex flex-col gap-2">
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
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
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
          
          <div className="flex-1"></div>
        </aside>
        
        {/* Mobile backdrop */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 md:ml-64">
          {/* Hero Section - Only show for admin pages */}
          {currentPageConfig && (
            <div className="bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white py-6 w-full">
              <div className="w-full px-4 text-center">
                <div className="mb-3">
                  <IconComponent className="w-8 h-8 mx-auto" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  {currentPageConfig.title}
                </h1>
                <p className="text-base text-red-100">
                  {currentPageConfig.description}
                </p>
              </div>
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 max-w-full mx-auto w-full overflow-y-auto">
            {/* Page Content */}
            <div className="container mx-auto px-6 py-6 pb-8 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      {/* Footer - Hidden */}
      {/* <div className="relative z-10">
        <Footer />
      </div> */}
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
});

export default AdminLayout;
