'use client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, ListOrdered, MapPin, Heart, Bell, Home as HomeIcon, Box, Info, Mail, Package, Settings, FileText, Shield, Star, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { UnifiedAvatar } from '@/components/ui/UnifiedAvatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Footer from '@/components/Footer';

const navItems = [
  { label: 'Quản lý tài khoản', href: '/dashboard', icon: User, description: 'Tổng quan tài khoản của bạn' },
  { label: 'Đơn hàng', href: '/dashboard/orders', icon: ListOrdered, description: 'Xem và quản lý đơn hàng' },
  { label: 'Hồ sơ', href: '/dashboard/profile', icon: User, description: 'Cập nhật thông tin cá nhân' },
  { label: 'Địa chỉ', href: '/dashboard/addresses', icon: MapPin, description: 'Quản lý địa chỉ giao hàng' },
  { label: 'Yêu thích', href: '/dashboard/wishlist', icon: Heart, description: 'Sản phẩm yêu thích' },
  { label: 'Thông báo', href: '/dashboard/notifications', icon: Bell, description: 'Xem thông báo mới' },
];

const mainNavItems = [
  { label: 'Trang chủ', href: '/', icon: HomeIcon },
  { label: 'Sản phẩm', href: '/products', icon: Box },
  { label: 'Giới thiệu', href: '/about', icon: Info },
  { label: 'Liên hệ', href: '/contact', icon: Mail },
  { label: 'Tra đơn', href: '/guest-orders', icon: Package },
];

// Page configurations for hero banners
const pageConfigs = {
  '/dashboard': {
    title: 'Quản Lý Tài Khoản',
    description: 'Tổng quan tài khoản và thông tin cá nhân của bạn',
    icon: User
  },
  '/dashboard/orders': {
    title: 'Đơn Hàng Của Tôi',
    description: 'Theo dõi trạng thái và lịch sử đơn hàng của bạn',
    icon: FileText
  },
  '/dashboard/profile': {
    title: 'Hồ Sơ Cá Nhân',
    description: 'Quản lý thông tin cá nhân và bảo mật tài khoản của bạn',
    icon: User
  },
  '/dashboard/addresses': {
    title: 'Địa Chỉ Của Tôi',
    description: 'Quản lý địa chỉ giao hàng và thanh toán của bạn',
    icon: MapPin
  },
  '/dashboard/wishlist': {
    title: 'Danh Sách Yêu Thích',
    description: 'Lưu trữ và quản lý các sản phẩm bạn yêu thích',
    icon: Heart
  },
  '/dashboard/notifications': {
    title: 'Thông Báo',
    description: 'Cập nhật về đơn hàng, khuyến mãi và thông tin quan trọng',
    icon: Bell
  }
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useRequireAuth('/login');

  // Get current page configuration
  const currentPageConfig = pageConfigs[pathname as keyof typeof pageConfigs];
  const IconComponent = currentPageConfig?.icon || FileText;

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white flex items-center justify-center">
        <Card className="w-96 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a10000] mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang tải...</h3>
          <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
        </Card>
      </div>
    );
  }

  // Show loading if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white flex items-center justify-center">
        <Card className="w-96 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a10000] mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang chuyển hướng...</h3>
          <p className="text-gray-600">Chuyển hướng đến trang đăng nhập</p>
        </Card>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-gray-200 shadow-sm py-6 px-6 sticky top-0 h-screen rounded-br-2xl border-b border-gray-200">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#a10000] rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Bảng điều khiển</h1>
                <p className="text-xs text-gray-600">Quản lý tài khoản của bạn</p>
              </div>
            </div>
            
            {/* User Info */}
            <Card className="p-3 bg-gray-50 border-gray-200">
              <div className="flex items-center gap-3">
                <UnifiedAvatar
                  user={user}
                  size={36}
                  className=""
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm">{user?.name || 'Người dùng'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Dashboard Navigation */}
          <nav className="flex flex-col gap-1.5 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Quản lý tài khoản
            </h3>
            {navItems.map(({ label, href, icon: Icon, description }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 group',
                  pathname === href
                    ? 'bg-[#a10000] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-[#a10000]'
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  pathname === href ? "text-white" : "text-gray-500 group-hover:text-[#a10000]"
                )} />
                <div className="flex-1">
                  <span>{label}</span>
                  <p className="text-xs opacity-75 mt-0.5 leading-tight">{description}</p>
                </div>
              </Link>
            ))}
          </nav>
          
          <Separator className="my-4" />
          
          {/* Main Navigation */}
          <nav className="flex flex-col gap-1.5 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Điều hướng chính
            </h3>
            {mainNavItems.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 group',
                  pathname === href
                    ? 'bg-[#a10000] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-[#a10000]'
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  pathname === href ? "text-white" : "text-gray-500 group-hover:text-[#a10000]"
                )} />
                <div className="flex-1">
                  <span>{label}</span>
                  <p className="text-xs opacity-75 mt-0.5 leading-tight">
                    {href === '/' && 'Về trang chủ chính'}
                    {href === '/products' && 'Khám phá sản phẩm'}
                    {href === '/about' && 'Tìm hiểu về chúng tôi'}
                    {href === '/contact' && 'Liên hệ hỗ trợ'}
                    {href === '/guest-orders' && 'Tra cứu đơn hàng'}
                  </p>
                </div>
              </Link>
            ))}
          </nav>


        </aside>

        {/* Mobile Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden">
          <div className="flex justify-around items-center h-16 px-2">
            {navItems.slice(0, 4).map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full text-xs font-medium transition-colors',
                  pathname === href
                    ? 'text-[#a10000]'
                    : 'text-gray-600 hover:text-[#a10000]'
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 w-full pb-20 lg:pb-0">
          {/* Hero Section - Only show for dashboard pages */}
          {currentPageConfig && (
            <div className="bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white py-12 w-full">
              <div className="max-w-7xl mx-auto px-4 text-center">
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
          <div className="max-w-6xl mx-auto px-4 py-12">
            {children}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
