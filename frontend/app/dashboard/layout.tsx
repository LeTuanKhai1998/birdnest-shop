'use client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, ListOrdered, MapPin, Heart, Bell, Home as HomeIcon, Box, Info, Mail, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useAuth';

const navItems = [
  { label: 'Đơn hàng', href: '/dashboard/orders', icon: ListOrdered },
  { label: 'Hồ sơ', href: '/dashboard/profile', icon: User },
  { label: 'Địa chỉ', href: '/dashboard/addresses', icon: MapPin },
  { label: 'Yêu thích', href: '/dashboard/wishlist', icon: Heart },
  { label: 'Thông báo', href: '/notifications', icon: Bell },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useRequireAuth('/login');

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Show loading if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r shadow-sm py-8 px-4 sticky top-0 h-screen">
          <div className="mb-8 text-2xl font-bold tracking-tight">
            Bảng điều khiển
          </div>
          <nav className="flex flex-col gap-2">
            {navItems.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg font-medium hover:bg-gray-100 transition',
                  pathname === href
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-700',
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
          
          {/* Main Navigation */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Điều hướng chính
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium hover:bg-gray-100 transition text-gray-700"
              >
                <HomeIcon className="w-5 h-5" />
                <span>Trang chủ</span>
              </Link>
              <Link
                href="/products"
                className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium hover:bg-gray-100 transition text-gray-700"
              >
                <Box className="w-5 h-5" />
                <span>Sản phẩm</span>
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium hover:bg-gray-100 transition text-gray-700"
              >
                <Info className="w-5 h-5" />
                <span>Giới thiệu</span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium hover:bg-gray-100 transition text-gray-700"
              >
                <Mail className="w-5 h-5" />
                <span>Liên hệ</span>
              </Link>
              <Link
                href="/guest-orders"
                className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium hover:bg-gray-100 transition text-gray-700"
              >
                <Package className="w-5 h-5" />
                <span>Tra đơn</span>
              </Link>
            </nav>
          </div>
        </aside>
        {/* Mobile bottom navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t shadow flex justify-around items-center h-16 md:hidden">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full text-xs font-medium transition',
                pathname === href
                  ? 'text-primary'
                  : 'text-gray-600 hover:text-primary',
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              {label}
            </Link>
          ))}
        </nav>
        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
