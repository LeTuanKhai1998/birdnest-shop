'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Search,
  User,
  Menu,
  X,
  ShoppingBag,
  LogOut,
  Heart,
  Box,
  Settings,
  Home as HomeIcon,
  Info,
  Mail,
  LogIn,
  Package,
  Star,
  HelpCircle,
} from 'lucide-react';
import { CartIconWithBadge } from '@/components/CartIconWithBadge';
import { NotificationBell } from '@/components/NotificationBell';
import { useState, useRef, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { UnifiedAvatar } from '@/components/ui/UnifiedAvatar';
import { cn } from '@/lib/utils';
import { useSetting } from '@/lib/settings-context';

// Extend user type to include bio field
interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  bio?: string | null;
}

export function ResponsiveNavbar() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLeftMenuVisible, setIsLeftMenuVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const pathname = usePathname();
  const { user, loading } = useUser();

  // Use UserContext for authentication state
  const isAuthenticated = !!session || !!user;
  
  // Check if we're on dashboard or admin pages to hide left sidebar
  const isDashboardPage = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  
  // Get settings
  const storeName = useSetting('storeName') || 'Birdnest Shop';
  const logoUrl = useSetting('logoUrl') || '/images/logo.png';

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle left menu visibility based on scroll
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScrollForMenu = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
      
      // Hide menu when scrolling down, show when scrolling up
      if (scrollDirection === 'down' && currentScrollY > 100) {
        setIsLeftMenuVisible(false);
      } else if (scrollDirection === 'up') {
        setIsLeftMenuVisible(true);
      }
      
      setLastScrollY(currentScrollY);
      
      // Clear timeout and reset scrolling state
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
      }, 150);
    };

    window.addEventListener('scroll', handleScrollForMenu, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScrollForMenu);
      clearTimeout(scrollTimeout);
    };
  }, [lastScrollY]);

  // Close sidebar when route changes
  useEffect(() => {
    setDesktopSidebarOpen(false);
    setSheetOpen(false);
  }, [pathname]);

  // Focus search input when search modal opens
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showSearch]);

  const navigationItems = [
    { href: '/', label: 'Trang chủ', icon: HomeIcon },
    { href: '/products', label: 'Sản phẩm', icon: Box },
    { href: '/about', label: 'Giới thiệu', icon: Info },
    { href: '/contact', label: 'Liên hệ', icon: Mail },
    { href: '/guest-orders', label: 'Tra đơn', icon: Package },
  ];

  // Add dashboard link for authenticated users
  const allNavigationItems = isAuthenticated 
    ? [...navigationItems, { href: '/dashboard', label: 'Tài khoản', icon: User }]
    : navigationItems;

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Handle logout for both NextAuth and localStorage
  const handleLogout = async () => {
    // Clear localStorage
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    
    // Sign out from NextAuth if session exists
    if (session) {
      await signOut();
    }
    
    // Redirect to home
    window.location.href = '/';
  };

  // Handle logout with sidebar close
  const handleLogoutWithClose = async () => {
    setSheetOpen(false);
    await handleLogout();
  };

  // Handle logout with desktop sidebar close
  const handleLogoutWithDesktopClose = async () => {
    setDesktopSidebarOpen(false);
    await handleLogout();
  };

  return (
    <>
      {/* Enhanced Static Left Sidebar - Tablet and Desktop */}
      <div className={cn(
        "hidden md:block fixed left-0 top-0 h-full w-24 bg-white/95 backdrop-blur-sm border-r border-gray-100 shadow-lg z-[60] transition-all duration-500 ease-in-out group",
        isLeftMenuVisible && !isDashboardPage ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Enhanced hover trigger area */}
        <div className="absolute -right-2 top-0 w-4 h-full bg-transparent group-hover:bg-transparent" />
        <div className="flex flex-col h-full">
          {/* Enhanced Navigation Items with Icons and Text Under */}
          <nav className="flex-1 p-3" role="navigation" aria-label="Main navigation">
            <div className="space-y-2">
              {/* Enhanced Hamburger Button with better accessibility */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center justify-center w-full p-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md group focus:ring-2 focus:ring-red-200 focus:ring-offset-1"
                onClick={() => setDesktopSidebarOpen(true)}
                aria-label="Mở menu bên"
                aria-expanded={desktopSidebarOpen}
                aria-controls="desktop-sidebar"
              >
                <Menu className="w-5 h-5 text-gray-700 group-hover:text-[#a10000] transition-colors" aria-hidden="true" />
              </Button>

              {/* Navigation Items with enhanced accessibility and visual feedback */}
              {allNavigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = isActiveLink(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-1 animate-in slide-in-from-left-2",
                      isActive 
                        ? "bg-gradient-to-r from-red-50 to-red-100 text-[#a10000] shadow-md scale-105 ring-1 ring-red-200" 
                        : "text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-[#a10000] hover:shadow-md hover:scale-105"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                    title={item.label}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {/* Icon with enhanced accessibility and subtle animation */}
                    <Icon 
                      className={cn(
                        "w-5 h-5 transition-all duration-300",
                        isActive ? "text-[#a10000] scale-110" : "group-hover:text-[#a10000] group-hover:scale-110"
                      )} 
                      aria-hidden="true"
                    />
                    
                    {/* Label with full text display and better typography */}
                    <span className="text-xs font-semibold text-center leading-tight transition-colors w-full group-hover:font-bold">
                      {item.label}
                    </span>
                    
                    {/* Enhanced Active indicator with better positioning and animation */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#a10000] to-[#c41e3a] rounded-r-full shadow-sm animate-in slide-in-from-left-1" />
                    )}
                    
                    {/* Hover effect overlay with better performance and subtle animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-red-100/50 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl pointer-events-none group-hover:scale-105" />
                    
                    {/* Focus indicator for better accessibility */}
                    <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-focus:ring-red-200 group-focus:ring-offset-1 transition-all duration-200" />
                    
                    {/* Subtle pulse animation for active items */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-red-100/20 animate-pulse pointer-events-none" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
          
          {/* Enhanced Bottom Section for User Actions */}
          <div className="p-3 border-t border-gray-100 bg-gray-50/30">
            <div className="space-y-2">
              {/* Quick Access to Cart with enhanced feedback */}
              <Link
                href="/cart"
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-[#a10000] hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-1"
                title="Giỏ hàng"
                aria-label="Xem giỏ hàng"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 transition-all duration-300 group-hover:text-[#a10000] group-hover:scale-110" aria-hidden="true" />
                  {/* Cart badge indicator */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>
                <span className="text-xs font-semibold text-center leading-tight transition-colors w-full group-hover:font-bold">Giỏ hàng</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-red-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
              </Link>
              
              {/* User Profile/Auth Section with enhanced states */}
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-[#a10000] hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-1"
                  title="Tài khoản"
                  aria-label="Quản lý tài khoản"
                >
                  <User className="w-5 h-5 transition-all duration-300 group-hover:text-[#a10000] group-hover:scale-110" aria-hidden="true" />
                  <span className="text-xs font-semibold text-center leading-tight transition-colors w-full group-hover:font-bold">Tài khoản</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-red-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-[#a10000] hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-1"
                  title="Đăng nhập"
                  aria-label="Đăng nhập vào tài khoản"
                >
                  <LogIn className="w-5 h-5 transition-all duration-300 group-hover:text-[#a10000] group-hover:scale-110" aria-hidden="true" />
                  <span className="text-xs font-semibold text-center leading-tight transition-colors w-full group-hover:font-bold">Đăng nhập</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-red-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div>
        {/* Enhanced Full-width background container */}
        <div className={cn(
          "w-full bg-gradient-to-r from-[#fdf6ef] to-[#fef8f2] border-b border-gray-100 shadow-lg fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled && "shadow-xl bg-gradient-to-r from-[#fdf6ef]/98 to-[#fef8f2]/98 backdrop-blur-md"
        )}>
          {/* Enhanced Content container */}
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between h-16 lg:h-20 px-4 lg:px-6 xl:px-8">
              {/* Enhanced Left: Logo and Brand Name */}
              <div className="flex items-center flex-shrink-0">
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#a10000] to-[#c41e3a] rounded-full blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                    <Image
                      src={logoUrl}
                      alt={`${storeName} Logo`}
                      width={40}
                      height={40}
                      className="relative w-8 h-8 lg:w-10 lg:h-10 border-2 border-yellow-400 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                      priority
                    />
                  </div>
                  {/* Enhanced shop name */}
                  <span className="hidden sm:block text-lg lg:text-xl font-bold bg-gradient-to-r from-[#a10000] to-[#c41e3a] bg-clip-text text-transparent tracking-wide group-hover:from-[#8a0000] group-hover:to-[#a10000] transition-all duration-300">
                    {storeName}
                  </span>
                </Link>
              </div>

              {/* Enhanced Right: Search, Icons, User */}
              <div className="flex items-center gap-3 lg:gap-6">
                {/* Enhanced Search - Desktop */}
                <div className="hidden md:flex items-center">
                  <form
                    className="relative group"
                    onSubmit={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-red-100 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      className="relative w-56 lg:w-72 pl-4 pr-12 py-3 text-sm border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#a10000] focus:border-[#a10000] transition-all duration-300 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                      aria-label="Tìm kiếm sản phẩm"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#a10000] hover:bg-red-50 rounded-full transition-all duration-300 hover:scale-110"
                      aria-label="Tìm kiếm"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Enhanced Search - Mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden p-2.5 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
                  onClick={() => setShowSearch(true)}
                  aria-label="Mở tìm kiếm"
                >
                  <Search className="w-5 h-5 text-gray-700 hover:text-[#a10000] transition-colors" />
                </Button>

                {/* Enhanced Cart - All Screen Sizes */}
                <div className="relative">
                  <CartIconWithBadge />
                </div>

                {/* Enhanced Notifications */}
                <NotificationBell />

                {/* Enhanced User Menu - All Screen Sizes */}
                <div className="flex items-center">
                  {!isAuthenticated ? (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex items-center gap-2.5 px-4 py-2.5 border-2 border-[#a10000] text-[#a10000] hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:border-[#c41e3a] hover:text-[#c41e3a] transition-all duration-300 hover:scale-105 hover:shadow-md rounded-xl font-semibold"
                    >
                      <Link
                        href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Đăng nhập</span>
                      </Link>
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md group"
                          >
                            {!loading && user ? (
                              <UnifiedAvatar
                                user={user}
                                size={32}
                                className="w-8 h-8 transition-all duration-300"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
                            )}
                            <div className="text-left">
                              <div className="text-sm font-semibold text-gray-800 group-hover:text-[#a10000] transition-colors">
                                {user?.name}
                              </div>
                              {(user as ExtendedUser)?.bio && (
                                <div className="text-xs text-gray-500 italic truncate max-w-32 group-hover:text-gray-600 transition-colors">
                                  &ldquo;{(user as ExtendedUser).bio}&rdquo;
                                </div>
                              )}
                            </div>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <div className="p-2 border-b">
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                            {(user as ExtendedUser)?.bio && (
                              <p className="text-xs text-gray-400 italic mt-1">&ldquo;{(user as ExtendedUser).bio}&rdquo;</p>
                            )}
                          </div>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/profile">
                              <User className="w-4 h-4 mr-2" />
                              Hồ sơ
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard">
                              <HomeIcon className="w-4 h-4 mr-2" />
                              Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/orders">
                              <ShoppingBag className="w-4 h-4 mr-2" />
                              Đơn hàng
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/wishlist">
                              <Heart className="w-4 h-4 mr-2" />
                              Yêu thích
                            </Link>
                          </DropdownMenuItem>
                          {session?.user?.isAdmin && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href="/admin">
                                  <Settings className="w-4 h-4 mr-2" />
                                  Quản trị
                                </Link>
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-600 focus:text-red-600"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Đăng xuất
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                {/* Enhanced Mobile Menu Button */}
                <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
                  <DrawerTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden p-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a10000] hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
                      aria-label="Mở menu"
                    >
                      <Menu className="w-5 h-5 text-gray-700 hover:text-[#a10000] transition-colors" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="w-80 p-0 h-full max-h-screen" data-vaul-drawer-direction="left">
                    <DrawerTitle className="sr-only">Menu Điều Hướng Di Động</DrawerTitle>
                    <div className="p-6 h-full overflow-y-auto bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-center justify-between mb-8">
                        <Link
                          href="/"
                          className="flex items-center gap-3 group"
                          onClick={() => setSheetOpen(false)}
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#a10000] to-[#c41e3a] rounded-full blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                            <Image
                              src={logoUrl}
                              alt={`${storeName} Logo`}
                              width={40}
                              height={40}
                              className="relative border-2 border-yellow-400 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                            />
                          </div>
                          <span className="font-bold text-xl bg-gradient-to-r from-[#a10000] to-[#c41e3a] bg-clip-text text-transparent group-hover:from-[#8a0000] group-hover:to-[#a10000] transition-all duration-300">
                            {storeName}
                          </span>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSheetOpen(false)}
                          aria-label="Đóng menu"
                          className="hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
                        >
                          <X className="w-6 h-6 text-gray-700 hover:text-[#a10000] transition-colors" />
                        </Button>
                      </div>

                      {/* Enhanced Mobile Search */}
                      <div className="mb-8">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            setSheetOpen(false);
                          }}
                        >
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-red-100 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <input
                              type="text"
                              placeholder="Tìm kiếm sản phẩm..."
                              className="relative w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a10000] focus:border-[#a10000] transition-all duration-300 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                              aria-label="Tìm kiếm sản phẩm"
                            />
                            <button
                              type="submit"
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#a10000] hover:bg-red-50 rounded-full transition-all duration-300 hover:scale-110"
                              aria-label="Tìm kiếm"
                            >
                              <Search className="w-5 h-5" />
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Enhanced Mobile Navigation */}
                      <nav className="space-y-2 mb-8">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
                          Điều hướng
                        </h3>
                        {allNavigationItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 text-lg group",
                                isActiveLink(item.href) && "bg-gradient-to-r from-red-50 to-red-100 text-[#a10000] border-r-2 border-[#a10000] shadow-md scale-105"
                              )}
                              onClick={() => setSheetOpen(false)}
                            >
                              <Icon className={cn(
                                "w-6 h-6 transition-all duration-300",
                                isActiveLink(item.href) ? "text-[#a10000]" : "text-gray-600 group-hover:text-[#a10000]"
                              )} />
                              {item.label}
                            </Link>
                          );
                        })}
                      </nav>

                      {/* Enhanced User Section */}
                      {isAuthenticated && (
                        <div className="mb-8">
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
                            Tài khoản
                          </h3>
                          <div className="space-y-2">
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 group"
                              onClick={() => setSheetOpen(false)}
                            >
                              <UnifiedAvatar
                                user={user}
                                size={40}
                                className="bg-transparent transition-all duration-300"
                              />
                              <div>
                                <div className="font-semibold text-gray-800 group-hover:text-[#a10000] transition-colors">
                                  {user?.name}
                                </div>
                                <div className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                                  {user?.email}
                                </div>
                                {(user as ExtendedUser)?.bio && (
                                  <div className="text-xs text-gray-400 italic mt-1 group-hover:text-gray-500 transition-colors">
                                    &ldquo;{(user as ExtendedUser).bio}&rdquo;
                                  </div>
                                )}
                              </div>
                            </Link>
                            <Link
                              href="/dashboard/orders"
                              className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 group"
                              onClick={() => setSheetOpen(false)}
                            >
                              <ShoppingBag className="w-6 h-6 text-gray-600 group-hover:text-[#a10000] transition-colors" />
                              <span className="group-hover:text-[#a10000] transition-colors">Đơn hàng</span>
                            </Link>
                            <Link
                              href="/dashboard/wishlist"
                              className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 group"
                              onClick={() => setSheetOpen(false)}
                            >
                              <Heart className="w-6 h-6 text-gray-600 group-hover:text-[#a10000] transition-colors" />
                              <span className="group-hover:text-[#a10000] transition-colors">Yêu thích</span>
                            </Link>
                            {session?.user?.isAdmin && (
                              <Link
                                href="/admin"
                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 group"
                                onClick={() => setSheetOpen(false)}
                              >
                                <Settings className="w-6 h-6 text-gray-600 group-hover:text-[#a10000] transition-colors" />
                                <span className="group-hover:text-[#a10000] transition-colors">Quản trị</span>
                              </Link>
                            )}
                            <button
                              onClick={handleLogoutWithClose}
                              className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 w-full text-left text-[#a10000] group"
                            >
                              <LogOut className="w-6 h-6" />
                              <span>Đăng xuất</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Enhanced Guest Sign In */}
                      {!isAuthenticated && (
                        <div className="mb-8">
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
                            Tài khoản
                          </h3>
                          <Button
                            asChild
                            variant="outline"
                            className="w-full flex items-center gap-3 border-2 border-[#a10000] text-[#a10000] hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:border-[#c41e3a] hover:text-[#c41e3a] transition-all duration-300 hover:scale-105 hover:shadow-md rounded-xl font-semibold py-3"
                          >
                            <Link
                              href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                              onClick={() => setSheetOpen(false)}
                            >
                              <LogIn className="w-5 h-5" />
                              Đăng nhập
                            </Link>
                          </Button>
                        </div>
                      )}

                      {/* Enhanced Quick Links Section */}
                      <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
                          Liên kết nhanh
                        </h3>
                        <div className="space-y-2">
                          <Link
                            href="/products?category=refined"
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 text-sm group"
                            onClick={() => setSheetOpen(false)}
                          >
                            <Star className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-all duration-300" />
                            <span className="group-hover:text-[#a10000] transition-colors">Yến sào tinh chế</span>
                          </Link>
                          <Link
                            href="/products?category=raw"
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 text-sm group"
                            onClick={() => setSheetOpen(false)}
                          >
                            <Package className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-all duration-300" />
                            <span className="group-hover:text-[#a10000] transition-colors">Yến sào thô</span>
                          </Link>
                          <Link
                            href="/contact"
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 text-sm group"
                            onClick={() => setSheetOpen(false)}
                          >
                            <HelpCircle className="w-5 h-5 text-green-500 group-hover:scale-110 transition-all duration-300" />
                            <span className="group-hover:text-[#a10000] transition-colors">Hỗ trợ khách hàng</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>
          </div>
        </div>
        
        {/* Spacer to prevent content from being hidden behind fixed navbar */}
        <div className="h-16 lg:h-20"></div>
      </div>

      {/* Enhanced Desktop Sidebar */}
      <Drawer open={desktopSidebarOpen} onOpenChange={setDesktopSidebarOpen}>
        <DrawerContent className="w-80 p-0 h-full max-h-screen z-[70]" data-vaul-drawer-direction="left">
          <DrawerTitle className="sr-only">Menu Điều Hướng Máy Tính</DrawerTitle>
          <div className="p-6 h-full overflow-y-auto bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/"
                className="flex items-center gap-3 group"
                onClick={() => setDesktopSidebarOpen(false)}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#a10000] to-[#c41e3a] rounded-full blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                  <Image
                    src={logoUrl}
                    alt={`${storeName} Logo`}
                    width={40}
                    height={40}
                    className="relative border-2 border-yellow-400 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-[#a10000] to-[#c41e3a] bg-clip-text text-transparent group-hover:from-[#8a0000] group-hover:to-[#a10000] transition-all duration-300">
                  {storeName}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDesktopSidebarOpen(false)}
                aria-label="Đóng menu"
                className="hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <X className="w-6 h-6 text-gray-700 hover:text-[#a10000] transition-colors" />
              </Button>
            </div>

            {/* Enhanced Desktop Sidebar Search */}
            <div className="mb-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setDesktopSidebarOpen(false);
                }}
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-red-100 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="relative w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a10000] focus:border-[#a10000] transition-all duration-300 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                    aria-label="Tìm kiếm sản phẩm"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#a10000] hover:bg-red-50 rounded-full transition-all duration-300 hover:scale-110"
                    aria-label="Submit search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Enhanced Desktop Sidebar Navigation */}
            <nav className="space-y-2 mb-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
                Điều hướng
              </h3>
              {allNavigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 text-lg group",
                      isActiveLink(item.href) && "bg-gradient-to-r from-red-50 to-red-100 text-[#a10000] border-r-2 border-[#a10000] shadow-md scale-105"
                    )}
                    onClick={() => setDesktopSidebarOpen(false)}
                  >
                    <Icon className={cn(
                      "w-6 h-6 transition-all duration-300",
                      isActiveLink(item.href) ? "text-[#a10000]" : "text-gray-600 group-hover:text-[#a10000]"
                    )} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Enhanced User Section */}
            {isAuthenticated && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
                  Tài khoản
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 group"
                    onClick={() => setDesktopSidebarOpen(false)}
                  >
                    {!loading && user ? (
                      <UnifiedAvatar
                        user={user}
                        size={40}
                        showName={true}
                        showEmail={true}
                        className="bg-transparent transition-all duration-300"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
                    )}
                  </Link>
                  <Link
                    href="/dashboard/orders"
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 group"
                    onClick={() => setDesktopSidebarOpen(false)}
                  >
                    <ShoppingBag className="w-6 h-6 text-gray-600 group-hover:text-[#a10000] transition-colors" />
                    <span className="group-hover:text-[#a10000] transition-colors">Orders</span>
                  </Link>
                  <Link
                    href="/dashboard/wishlist"
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 group"
                    onClick={() => setDesktopSidebarOpen(false)}
                  >
                    <Heart className="w-6 h-6 text-gray-600 group-hover:text-[#a10000] transition-colors" />
                    <span className="group-hover:text-[#a10000] transition-colors">Wishlist</span>
                  </Link>
                  {session?.user?.isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 group"
                      onClick={() => setDesktopSidebarOpen(false)}
                    >
                      <Settings className="w-6 h-6 text-gray-600 group-hover:text-[#a10000] transition-colors" />
                      <span className="group-hover:text-[#a10000] transition-colors">Admin Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogoutWithDesktopClose}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 w-full text-left text-[#a10000] group"
                  >
                    <LogOut className="w-6 h-6" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}

            {/* Enhanced Guest Sign In */}
            {!isAuthenticated && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
                  Account
                </h3>
                <Button
                  asChild
                  variant="outline"
                  className="w-full flex items-center gap-3 border-2 border-[#a10000] text-[#a10000] hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:border-[#c41e3a] hover:text-[#c41e3a] transition-all duration-300 hover:scale-105 hover:shadow-md rounded-xl font-semibold py-3"
                >
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                    onClick={() => setDesktopSidebarOpen(false)}
                  >
                    <LogIn className="w-5 h-5" />
                    Sign in
                  </Link>
                </Button>
              </div>
            )}

            {/* Enhanced Quick Links Section */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
                Liên kết nhanh
              </h3>
              <div className="space-y-2">
                <Link
                  href="/products?category=refined"
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 text-sm group"
                  onClick={() => setDesktopSidebarOpen(false)}
                >
                  <Star className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-all duration-300" />
                  <span className="group-hover:text-[#a10000] transition-colors">Refined Bird&apos;s Nest</span>
                </Link>
                <Link
                  href="/products?category=raw"
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 text-sm group"
                  onClick={() => setDesktopSidebarOpen(false)}
                >
                  <Package className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-all duration-300" />
                  <span className="group-hover:text-[#a10000] transition-colors">Raw Bird&apos;s Nest</span>
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 text-sm group"
                  onClick={() => setDesktopSidebarOpen(false)}
                >
                  <HelpCircle className="w-5 h-5 text-green-500 group-hover:scale-110 transition-all duration-300" />
                  <span className="group-hover:text-[#a10000] transition-colors">Customer Support</span>
                </Link>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Enhanced Mobile Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mt-16 animate-in slide-in-from-top-4 duration-300 border-2 border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Search</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSearch(false)}
                  aria-label="Close search"
                  className="hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <X className="w-4 h-4 text-gray-700 hover:text-[#a10000] transition-colors" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowSearch(false);
                }}
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-red-100 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products..."
                    className="relative w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a10000] focus:border-[#a10000] transition-all duration-300 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                    autoFocus
                    aria-label="Search products"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#a10000] hover:bg-red-50 rounded-full transition-all duration-300 hover:scale-110"
                    aria-label="Submit search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
