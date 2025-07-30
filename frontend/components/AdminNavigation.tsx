'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home as HomeIcon,
  Box,
  Info,
  Mail,
  Package,
} from 'lucide-react';

const navigationItems = [
  { href: '/', label: 'Trang chủ', icon: HomeIcon },
  { href: '/products', label: 'Sản phẩm', icon: Box },
  { href: '/about', label: 'Giới thiệu', icon: Info },
  { href: '/contact', label: 'Liên hệ', icon: Mail },
  { href: '/guest-orders', label: 'Tra đơn', icon: Package },
];

export function AdminNavigation() {
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Main Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Điều hướng chính
            </h3>
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg transition-all duration-200 text-sm",
                      isActiveLink(item.href) 
                        ? "bg-red-50 text-red-600 font-medium" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-red-600"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 