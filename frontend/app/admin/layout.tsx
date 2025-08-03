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
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { UnifiedAvatar } from '@/components/ui/UnifiedAvatar';
import { Separator } from '@/components/ui/separator';

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
          "flex flex-col w-80 bg-white border-r border-gray-200 shadow-sm py-4 md:py-6 px-4 md:px-6 h-screen rounded-br-2xl border-b border-gray-200 overflow-y-auto transition-transform duration-300 ease-in-out z-20",
          "fixed md:sticky top-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          {/* Header */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#a10000] rounded-full flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base md:text-lg font-bold text-gray-900">Bảng điều khiển</h1>
                <p className="text-xs text-gray-600 hidden md:block">Tổng quan hiệu suất cửa hàng</p>
              </div>
            </div>
            
            {/* User Info */}
            <Card className="p-2 md:p-3 bg-gray-50 border-gray-200">
              <div className="flex items-center gap-2 md:gap-3">
                <UnifiedAvatar
                  user={{ name: 'Admin User', email: 'admin@birdnest.vn' }}
                  size={32}
                  className="md:w-9 md:h-9"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm">Admin User</p>
                  <p className="text-xs text-gray-500 truncate hidden md:block">admin@birdnest.vn</p>
                </div>
              </div>
            </Card>
          </div>
          <nav className="flex flex-col gap-1.5 mb-4 md:mb-6">
            <h3 className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Bảng điều khiển
            </h3>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-medium transition-all duration-200 group',
                  pathname === link.href
                    ? 'bg-[#a10000] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-[#a10000]'
                )}
              >
                <link.icon className={cn(
                  "w-4 h-4 md:w-5 md:h-5 transition-colors",
                  pathname === link.href ? "text-white" : "text-gray-500 group-hover:text-[#a10000]"
                )} />
                <div className="flex-1">
                  <span className="text-sm md:text-base">{link.label}</span>
                  <p className="text-xs opacity-75 mt-0.5 leading-tight hidden md:block">
                    {link.href === '/admin' && 'Tổng quan hiệu suất cửa hàng'}
                    {link.href === '/admin/orders' && 'Xem và quản lý đơn hàng'}
                    {link.href === '/admin/products' && 'Thêm, chỉnh sửa sản phẩm'}
                    {link.href === '/admin/categories' && 'Quản lý danh mục sản phẩm'}
                    {link.href === '/admin/users' && 'Xem thông tin khách hàng'}
                    {link.href === '/admin/settings' && 'Cấu hình hệ thống'}
                  </p>
                </div>
              </Link>
            ))}
          </nav>
          
          <Separator className="my-3 md:my-4" />
          
          {/* Main Navigation */}
          <nav className="flex flex-col gap-1.5 mb-4 md:mb-6">
            <h3 className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Điều hướng chính
            </h3>
            <Link
              href="/"
              className={cn(
                'flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-medium transition-all duration-200 group',
                pathname === '/'
                  ? 'bg-[#a10000] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-[#a10000]'
              )}
            >
              <HomeIcon className={cn(
                "w-4 h-4 md:w-5 md:h-5 transition-colors",
                pathname === '/' ? "text-white" : "text-gray-500 group-hover:text-[#a10000]"
              )} />
              <div className="flex-1">
                <span className="text-sm md:text-base">Trang chủ</span>
                <p className="text-xs opacity-75 mt-0.5 leading-tight hidden md:block">Về trang chủ chính</p>
              </div>
            </Link>
            <Link
              href="/products"
              className={cn(
                'flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-medium transition-all duration-200 group',
                pathname === '/products'
                  ? 'bg-[#a10000] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-[#a10000]'
              )}
            >
              <Box className={cn(
                "w-4 h-4 md:w-5 md:h-5 transition-colors",
                pathname === '/products' ? "text-white" : "text-gray-500 group-hover:text-[#a10000]"
              )} />
              <div className="flex-1">
                <span className="text-sm md:text-base">Sản phẩm</span>
                <p className="text-xs opacity-75 mt-0.5 leading-tight hidden md:block">Khám phá sản phẩm</p>
              </div>
            </Link>
            <Link
              href="/about"
              className={cn(
                'flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-medium transition-all duration-200 group',
                pathname === '/about'
                  ? 'bg-[#a10000] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-[#a10000]'
              )}
            >
              <Info className={cn(
                "w-4 h-4 md:w-5 md:h-5 transition-colors",
                pathname === '/about' ? "text-white" : "text-gray-500 group-hover:text-[#a10000]"
              )} />
              <div className="flex-1">
                <span className="text-sm md:text-base">Giới thiệu</span>
                <p className="text-xs opacity-75 mt-0.5 leading-tight hidden md:block">Tìm hiểu về chúng tôi</p>
              </div>
            </Link>
            <Link
              href="/contact"
              className={cn(
                'flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-medium transition-all duration-200 group',
                pathname === '/contact'
                  ? 'bg-[#a10000] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-[#a10000]'
              )}
            >
              <Mail className={cn(
                "w-4 h-4 md:w-5 md:h-5 transition-colors",
                pathname === '/contact' ? "text-white" : "text-gray-500 group-hover:text-[#a10000]"
              )} />
              <div className="flex-1">
                <span className="text-sm md:text-base">Liên hệ</span>
                <p className="text-xs opacity-75 mt-0.5 leading-tight hidden md:block">Liên hệ hỗ trợ</p>
              </div>
            </Link>
            <Link
              href="/guest-orders"
              className={cn(
                'flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-medium transition-all duration-200 group',
                pathname === '/guest-orders'
                  ? 'bg-[#a10000] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-[#a10000]'
              )}
            >
              <Package className={cn(
                "w-4 h-4 md:w-5 md:h-5 transition-colors",
                pathname === '/guest-orders' ? "text-white" : "text-gray-500 group-hover:text-[#a10000]"
              )} />
              <div className="flex-1">
                <span className="text-sm md:text-base">Tra đơn</span>
                <p className="text-xs opacity-75 mt-0.5 leading-tight hidden md:block">Tra cứu đơn hàng</p>
              </div>
            </Link>
          </nav>
          
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
        <div className="flex-1 flex flex-col min-w-0 md:ml-80">
          {/* Hero Section - Only show for admin pages */}
          {currentPageConfig && (
            <div className="bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white py-4 md:py-6 w-full">
              <div className="w-full px-4 text-center">
                <div className="mb-2 md:mb-3">
                  <IconComponent className="w-6 h-6 md:w-8 md:h-8 mx-auto" />
                </div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">
                  {currentPageConfig.title}
                </h1>
                <p className="text-sm md:text-base text-red-100">
                  {currentPageConfig.description}
                </p>
              </div>
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 max-w-full mx-auto w-full overflow-y-auto">
            {/* Page Content */}
            <div className="container mx-auto px-4 md:px-6 py-4 md:py-6 pb-8 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
});

export default AdminLayout;
