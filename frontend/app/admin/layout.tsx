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
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900">
        <div className="space-y-4 p-6">
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
        {/* Mobile menu button - Enhanced with modern mobile UX */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-3 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-700 hover:shadow-2xl transition-all duration-300 active:scale-95"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          )}
        </button>

        {/* Sidebar - Modern mobile-first design */}
        <aside className={cn(
          "flex flex-col w-80 bg-white dark:bg-neutral-800 border-r border-gray-200 dark:border-neutral-700 shadow-xl py-6 md:py-8 px-6 md:px-8 h-screen rounded-br-3xl border-b border-gray-200 dark:border-neutral-700 overflow-y-auto transition-all duration-500 ease-out z-40",
          "fixed md:sticky top-0",
          mobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-full md:translate-x-0 md:opacity-100 opacity-0"
        )}>
          {/* Header - Enhanced mobile spacing and typography */}
          <div className="mb-8 md:mb-10">
            <div className="flex items-center gap-4 md:gap-5 mb-4 md:mb-5">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#a10000] to-[#c41e3a] rounded-2xl flex items-center justify-center shadow-lg">
                <LayoutDashboard className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Bảng điều khiển</h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 hidden md:block">Tổng quan hiệu suất cửa hàng</p>
              </div>
            </div>
            
            {/* User Info - Modern card design */}
            <Card className="p-4 md:p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-neutral-700 dark:to-neutral-600 border-gray-200 dark:border-neutral-600 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4 md:gap-5">
                <UnifiedAvatar
                  user={{ name: 'Admin User', email: 'admin@birdnest.vn' }}
                  size={48}
                  className="md:w-12 md:h-12"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base md:text-lg">Admin User</p>
                  <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 truncate hidden md:block">admin@birdnest.vn</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Navigation - Modern mobile navigation patterns */}
          <nav className="flex flex-col gap-3 md:gap-4 mb-8 md:mb-10">
            <h3 className="text-sm md:text-base font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 md:mb-5">
              Bảng điều khiển
            </h3>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-4 md:gap-5 px-5 md:px-6 py-4 md:py-5 rounded-2xl font-medium transition-all duration-300 group relative overflow-hidden',
                  pathname === link.href
                    ? 'bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white shadow-lg scale-105'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-[#a10000] hover:scale-102'
                )}
              >
                {/* Background gradient effect */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-r from-[#a10000] to-[#c41e3a] opacity-0 transition-opacity duration-300",
                  pathname === link.href ? "opacity-100" : "group-hover:opacity-10"
                )} />
                
                <link.icon className={cn(
                  "w-6 h-6 md:w-7 md:h-7 transition-all duration-300 relative z-10",
                  pathname === link.href ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-[#a10000]"
                )} />
                <div className="flex-1 relative z-10">
                  <span className="text-base md:text-lg font-semibold">{link.label}</span>
                  <p className="text-sm opacity-75 mt-1 leading-tight hidden md:block">
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
          
          <Separator className="my-6 md:my-8" />
          
          {/* Main Navigation - Enhanced mobile experience */}
          <nav className="flex flex-col gap-3 md:gap-4 mb-8 md:mb-10">
            <h3 className="text-sm md:text-base font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 md:mb-5">
              Điều hướng chính
            </h3>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-4 md:gap-5 px-5 md:px-6 py-4 md:py-5 rounded-2xl font-medium transition-all duration-300 group relative overflow-hidden',
                pathname === '/'
                  ? 'bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white shadow-lg scale-105'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-[#a10000] hover:scale-102'
              )}
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r from-[#a10000] to-[#c41e3a] opacity-0 transition-opacity duration-300",
                pathname === '/' ? "opacity-100" : "group-hover:opacity-10"
              )} />
              <HomeIcon className={cn(
                "w-6 h-6 md:w-7 md:h-7 transition-all duration-300 relative z-10",
                pathname === '/' ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-[#a10000]"
              )} />
              <div className="flex-1 relative z-10">
                <span className="text-base md:text-lg font-semibold">Trang chủ</span>
                <p className="text-sm opacity-75 mt-1 leading-tight hidden md:block">Về trang chủ chính</p>
              </div>
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-4 md:gap-5 px-5 md:px-6 py-4 md:py-5 rounded-2xl font-medium transition-all duration-300 group relative overflow-hidden',
                pathname === '/products'
                  ? 'bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white shadow-lg scale-105'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-[#a10000] hover:scale-102'
              )}
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r from-[#a10000] to-[#c41e3a] opacity-0 transition-opacity duration-300",
                pathname === '/products' ? "opacity-100" : "group-hover:opacity-10"
              )} />
              <Box className={cn(
                "w-6 h-6 md:w-7 md:h-7 transition-all duration-300 relative z-10",
                pathname === '/products' ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-[#a10000]"
              )} />
              <div className="flex-1 relative z-10">
                <span className="text-base md:text-lg font-semibold">Sản phẩm</span>
                <p className="text-sm opacity-75 mt-1 leading-tight hidden md:block">Khám phá sản phẩm</p>
              </div>
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-4 md:gap-5 px-5 md:px-6 py-4 md:py-5 rounded-2xl font-medium transition-all duration-300 group relative overflow-hidden',
                pathname === '/about'
                  ? 'bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white shadow-lg scale-105'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-[#a10000] hover:scale-102'
              )}
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r from-[#a10000] to-[#c41e3a] opacity-0 transition-opacity duration-300",
                pathname === '/about' ? "opacity-100" : "group-hover:opacity-10"
              )} />
              <Info className={cn(
                "w-6 h-6 md:w-7 md:h-7 transition-all duration-300 relative z-10",
                pathname === '/about' ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-[#a10000]"
              )} />
              <div className="flex-1 relative z-10">
                <span className="text-base md:text-lg font-semibold">Giới thiệu</span>
                <p className="text-sm opacity-75 mt-1 leading-tight hidden md:block">Tìm hiểu về chúng tôi</p>
              </div>
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-4 md:gap-5 px-5 md:px-6 py-4 md:py-5 rounded-2xl font-medium transition-all duration-300 group relative overflow-hidden',
                pathname === '/contact'
                  ? 'bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white shadow-lg scale-105'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-[#a10000] hover:scale-102'
              )}
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r from-[#a10000] to-[#c41e3a] opacity-0 transition-opacity duration-300",
                pathname === '/contact' ? "opacity-100" : "group-hover:opacity-10"
              )} />
              <Mail className={cn(
                "w-6 h-6 md:w-7 md:h-7 transition-all duration-300 relative z-10",
                pathname === '/contact' ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-[#a10000]"
              )} />
              <div className="flex-1 relative z-10">
                <span className="text-base md:text-lg font-semibold">Liên hệ</span>
                <p className="text-sm opacity-75 mt-1 leading-tight hidden md:block">Liên hệ hỗ trợ</p>
              </div>
            </Link>
            <Link
              href="/guest-orders"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-4 md:gap-5 px-5 md:px-6 py-4 md:py-5 rounded-2xl font-medium transition-all duration-300 group relative overflow-hidden',
                pathname === '/guest-orders'
                  ? 'bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white shadow-lg scale-105'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-[#a10000] hover:scale-102'
              )}
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r from-[#a10000] to-[#c41e3a] opacity-0 transition-opacity duration-300",
                pathname === '/guest-orders' ? "opacity-100" : "group-hover:opacity-10"
              )} />
              <Package className={cn(
                "w-6 h-6 md:w-7 md:h-7 transition-all duration-300 relative z-10",
                pathname === '/guest-orders' ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-[#a10000]"
              )} />
              <div className="flex-1 relative z-10">
                <span className="text-base md:text-lg font-semibold">Tra đơn</span>
                <p className="text-sm opacity-75 mt-1 leading-tight hidden md:block">Tra cứu đơn hàng</p>
              </div>
            </Link>
          </nav>
          
          <div className="flex-1"></div>
        </aside>
        
        {/* Mobile backdrop - Enhanced with modern blur effect */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main content area - Modern mobile-first layout */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Hero Section - Enhanced mobile design */}
          {currentPageConfig && (
            <div className="bg-gradient-to-br from-[#a10000] via-[#b51a2a] to-[#c41e3a] text-white py-8 md:py-10 w-full relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 w-full px-6 md:px-8 text-center">
                <div className="mb-4 md:mb-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto backdrop-blur-sm">
                    <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
                  {currentPageConfig.title}
                </h1>
                <p className="text-base md:text-lg lg:text-xl text-red-100 px-4 md:px-0 max-w-2xl mx-auto">
                  {currentPageConfig.description}
                </p>
              </div>
            </div>
          )}

          {/* Main content - Enhanced mobile spacing and typography */}
          <main className="flex-1 max-w-full mx-auto w-full overflow-y-auto pb-28 md:pb-0">
            {/* Page Content - Modern mobile container */}
            <div className="container mx-auto px-6 md:px-8 py-8 md:py-10 pb-8 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Modern mobile navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl border-t border-gray-200 dark:border-neutral-700 shadow-2xl md:hidden">
        <div className="flex justify-around items-center h-24 px-4 py-3">
          {navLinks.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full text-xs font-semibold transition-all duration-300 relative group py-2',
                pathname === href
                  ? 'text-[#a10000] scale-110'
                  : 'text-gray-600 dark:text-gray-400 hover:text-[#a10000] hover:scale-105'
              )}
            >
              <Icon className={cn(
                "w-7 h-7 mb-2 transition-all duration-300",
                pathname === href ? "text-[#a10000] scale-110" : "group-hover:scale-110"
              )} />
              <span className="text-xs font-bold">{label}</span>
              
              {/* Active indicator - Modern design */}
              {pathname === href && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-[#a10000] to-[#c41e3a] rounded-full shadow-lg" />
              )}
              
              {/* Hover effect - Enhanced visual feedback */}
              <div className="absolute inset-0 bg-red-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            </Link>
          ))}
        </div>
      </nav>
      
      {/* Footer */}
      <Footer />
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
});

export default AdminLayout;
