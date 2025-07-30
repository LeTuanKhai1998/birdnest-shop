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
  Bell,
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
import { Avatar as ShadcnAvatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useSetting } from '@/lib/settings-context';

export function ResponsiveNavbar() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLeftMenuVisible, setIsLeftMenuVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [localUser, setLocalUser] = useState<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const pathname = usePathname();
  const userFromSession = session?.user;
  
  // Check for localStorage authentication
  useEffect(() => {
    const checkLocalAuth = () => {
      const authToken = localStorage.getItem('auth-token');
      const userData = localStorage.getItem('user');
      
      if (authToken && userData) {
        try {
          const user = JSON.parse(userData);
          setLocalUser(user);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('auth-token');
          localStorage.removeItem('user');
          setLocalUser(null);
        }
      } else {
        setLocalUser(null);
      }
    };

    checkLocalAuth();
    
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-token' || e.key === 'user') {
        checkLocalAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Use session data or local user data
  const user = userFromSession || localUser;
  const isAuthenticated = !!session || !!localUser;
  
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
      setIsScrolling(true);
      
      // Clear timeout and reset scrolling state
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
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
    setLocalUser(null);
    
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
      {/* Static Left Sidebar - Tablet and Desktop */}
      <div className={cn(
        "hidden md:block fixed left-0 top-0 h-full w-20 bg-white border-r border-gray-200 z-[60] transition-all duration-500 ease-in-out group",
        isLeftMenuVisible && !isDashboardPage ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Hover trigger area */}
        <div className="absolute -right-2 top-0 w-4 h-full bg-transparent group-hover:bg-transparent" />
        <div className="flex flex-col h-full">
          {/* Navigation Items with Icons and Text Under */}
          <nav className="flex-1 p-3">
            <div className="space-y-4">
              {/* Hamburger Button - Icon only, bigger size */}
              <Button
                variant="ghost"
                className="flex items-center justify-center w-full p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
                onClick={() => setDesktopSidebarOpen(true)}
                                      aria-label="Mở menu bên"
                aria-expanded={desktopSidebarOpen}
              >
                <Menu className="w-6 h-6" />
              </Button>

              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 group relative",
                      isActiveLink(item.href) 
                        ? "bg-red-50 text-red-600" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-red-600"
                    )}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                    {/* Active indicator */}
                    {isActiveLink(item.href) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-600 rounded-r-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>


        </div>
      </div>

      {/* Main Content - No left margin since sidebar overlays */}
      <div>
        {/* Full-width background container - Always sticky */}
        <div className={cn(
          "w-full bg-[#fdf6ef] border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled && "shadow-md bg-[#fdf6ef]/95 backdrop-blur-sm"
        )}>
          {/* Content container */}
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between h-16 lg:h-20 px-4 lg:px-6 xl:px-8">
              {/* Left: Logo and Brand Name */}
              <div className="flex items-center flex-shrink-0">
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="relative">
                    <Image
                      src={logoUrl}
                      alt={`${storeName} Logo`}
                      width={40}
                      height={40}
                      className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-yellow-400 rounded-full transition-transform group-hover:scale-105"
                      priority
                    />
                  </div>
                  {/* Hide shop name on small screens */}
                  <span className="hidden sm:block text-lg lg:text-xl font-bold text-red-700 tracking-wide group-hover:text-red-800 transition-colors">
                    {storeName}
                  </span>
                </Link>
              </div>



              {/* Right: Search, Icons, User */}
              <div className="flex items-center gap-2 lg:gap-4">
                {/* Search - Desktop */}
                <div className="hidden md:flex items-center">
                  <form
                    className="relative"
                    onSubmit={(e) => {
                      e.preventDefault();
                      // TODO: Implement search functionality
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      className="w-56 lg:w-72 pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all hover:border-gray-400"
                      aria-label="Tìm kiếm sản phẩm"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Tìm kiếm"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Search - Mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setShowSearch(true)}
                                        aria-label="Mở tìm kiếm"
                >
                  <Search className="w-5 h-5" />
                </Button>

                {/* Cart - All Screen Sizes */}
                <div className="relative">
                  <CartIconWithBadge />
                </div>

                {/* Notifications */}
                <NotificationBell />

                {/* User Menu - All Screen Sizes */}
                <div className="flex items-center">
                  {!isAuthenticated ? (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex items-center gap-2 hover:bg-red-50 hover:border-red-300 transition-colors"
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
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ShadcnAvatar
                              src={user?.image || '/images/user.jpeg'}
                              name={user?.name}
                              size={32}
                              className="w-8 h-8"
                            />
                            <div className="text-left">
                              <div className="text-sm font-medium">{user?.name}</div>
                              {(user as any)?.bio && (
                                <div className="text-xs text-gray-500 italic truncate max-w-32">"{(user as any).bio}"</div>
                              )}
                              {/* Debug: Show if bio exists */}
                              <div className="text-xs text-red-500">
                                Bio: {(user as any)?.bio ? 'Yes' : 'No'} - {JSON.stringify((user as any)?.bio)}
                              </div>
                            </div>
                          </Button>
                        </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <div className="p-2 border-b">
                          <p className="text-sm font-medium">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                          {(user as any)?.bio && (
                            <p className="text-xs text-gray-400 italic mt-1">"{(user as any).bio}"</p>
                          )}
                        </div>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/profile">
                            <User className="w-4 h-4 mr-2" />
                            Hồ sơ
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

                {/* Mobile Menu Button */}
                <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
                  <DrawerTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Mở menu"
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="w-80 p-0 h-full max-h-screen" data-vaul-drawer-direction="left">
                    <DrawerTitle className="sr-only">Menu Điều Hướng Di Động</DrawerTitle>
                    <div className="p-6 h-full overflow-y-auto bg-white">
                      <div className="flex items-center justify-between mb-8">
                        <Link
                          href="/"
                          className="flex items-center gap-3 group"
                          onClick={() => setSheetOpen(false)}
                        >
                          <Image
                            src={logoUrl}
                            alt={`${storeName} Logo`}
                            width={40}
                            height={40}
                            className="border-2 border-yellow-400 rounded-full transition-transform group-hover:scale-105"
                          />
                          <span className="font-bold text-xl text-red-700 group-hover:text-red-800 transition-colors">
                            {storeName}
                          </span>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSheetOpen(false)}
                          aria-label="Đóng menu"
                          className="hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </Button>
                      </div>

                      {/* Mobile Search */}
                      <div className="mb-8">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            setSheetOpen(false);
                          }}
                        >
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Tìm kiếm sản phẩm..."
                              className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all hover:border-gray-400"
                              aria-label="Tìm kiếm sản phẩm"
                            />
                            <button
                              type="submit"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                              aria-label="Tìm kiếm"
                            >
                              <Search className="w-5 h-5" />
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Mobile Navigation */}
                      <nav className="space-y-2 mb-8">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                          Điều hướng
                        </h3>
                        {navigationItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-all duration-200 text-lg group",
                                isActiveLink(item.href) && "bg-red-50 text-red-600 border-r-2 border-red-600"
                              )}
                              onClick={() => setSheetOpen(false)}
                            >
                              <Icon className={cn(
                                "w-6 h-6 transition-colors",
                                isActiveLink(item.href) ? "text-red-600" : "text-gray-600 group-hover:text-red-600"
                              )} />
                              {item.label}
                            </Link>
                          );
                        })}
                      </nav>

                      {/* User Section */}
                      {isAuthenticated && (
                        <div className="mb-8">
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                            Tài khoản
                          </h3>
                          <div className="space-y-2">
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                              onClick={() => setSheetOpen(false)}
                            >
                              <User className="w-6 h-6" />
                              <div>
                                <div className="font-medium">{user?.name}</div>
                                <div className="text-sm text-gray-500">{user?.email}</div>
                                {(user as any)?.bio && (
                                  <div className="text-xs text-gray-400 italic mt-1">"{(user as any).bio}"</div>
                                )}
                              </div>
                            </Link>
                            <Link
                              href="/dashboard/orders"
                              className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                              onClick={() => setSheetOpen(false)}
                            >
                              <ShoppingBag className="w-6 h-6" />
                              Đơn hàng
                            </Link>
                            <Link
                              href="/dashboard/wishlist"
                              className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                              onClick={() => setSheetOpen(false)}
                            >
                              <Heart className="w-6 h-6" />
                              Yêu thích
                            </Link>
                            {session?.user?.isAdmin && (
                              <Link
                                href="/admin"
                                className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={() => setSheetOpen(false)}
                              >
                                <Settings className="w-6 h-6" />
                                Quản trị
                              </Link>
                            )}
                                                          <button
                                onClick={handleLogoutWithClose}
                                className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors w-full text-left text-red-600"
                              >
                                <LogOut className="w-6 h-6" />
                                Đăng xuất
                              </button>
                          </div>
                        </div>
                      )}

                      {/* Guest Sign In */}
                      {!isAuthenticated && (
                        <div className="mb-8">
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                            Tài khoản
                          </h3>
                          <Button
                            asChild
                            variant="outline"
                            className="w-full flex items-center gap-3 hover:bg-red-50 hover:border-red-300 transition-colors"
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

                      {/* Quick Links Section */}
                      <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                          Liên kết nhanh
                        </h3>
                        <div className="space-y-2">
                          <Link
                            href="/products?category=refined"
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                            onClick={() => setSheetOpen(false)}
                          >
                            <Star className="w-5 h-5 text-yellow-500" />
                            Yến sào tinh chế
                          </Link>
                          <Link
                            href="/products?category=raw"
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                            onClick={() => setSheetOpen(false)}
                          >
                            <Package className="w-5 h-5 text-blue-500" />
                            Yến sào thô
                          </Link>
                          <Link
                            href="/contact"
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                            onClick={() => setSheetOpen(false)}
                          >
                            <HelpCircle className="w-5 h-5 text-green-500" />
                            Hỗ trợ khách hàng
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

                    {/* Desktop Sidebar */}
              <Drawer open={desktopSidebarOpen} onOpenChange={setDesktopSidebarOpen}>
                <DrawerContent className="w-80 p-0 h-full max-h-screen z-[70]" data-vaul-drawer-direction="left">
          <DrawerTitle className="sr-only">Menu Điều Hướng Máy Tính</DrawerTitle>
          <div className="p-6 h-full overflow-y-auto bg-white">
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/"
                className="flex items-center gap-3 group"
                onClick={() => setDesktopSidebarOpen(false)}
              >
                <Image
                  src={logoUrl}
                  alt={`${storeName} Logo`}
                  width={40}
                  height={40}
                  className="border-2 border-yellow-400 rounded-full transition-transform group-hover:scale-105"
                />
                <span className="font-bold text-xl text-red-700 group-hover:text-red-800 transition-colors">
                  {storeName}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDesktopSidebarOpen(false)}
                                        aria-label="Đóng menu"
                className="hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Desktop Sidebar Search */}
            <div className="mb-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setDesktopSidebarOpen(false);
                }}
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all hover:border-gray-400"
                    aria-label="Tìm kiếm sản phẩm"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                    aria-label="Submit search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Desktop Sidebar Navigation */}
            <nav className="space-y-2 mb-8">
                              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Điều hướng
                </h3>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-all duration-200 text-lg group",
                      isActiveLink(item.href) && "bg-red-50 text-red-600 border-r-2 border-red-600"
                    )}
                    onClick={() => setDesktopSidebarOpen(false)}
                  >
                    <Icon className={cn(
                      "w-6 h-6 transition-colors",
                      isActiveLink(item.href) ? "text-red-600" : "text-gray-600 group-hover:text-red-600"
                    )} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* User Section */}
            {isAuthenticated && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Tài khoản
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setDesktopSidebarOpen(false)}
                  >
                    <User className="w-6 h-6" />
                    <div>
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-sm text-gray-500">{user?.email}</div>
                    </div>
                  </Link>
                  <Link
                    href="/dashboard/orders"
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setDesktopSidebarOpen(false)}
                  >
                    <ShoppingBag className="w-6 h-6" />
                    Orders
                  </Link>
                  <Link
                    href="/dashboard/wishlist"
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setDesktopSidebarOpen(false)}
                  >
                    <Heart className="w-6 h-6" />
                    Wishlist
                  </Link>
                  {session?.user?.isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => setDesktopSidebarOpen(false)}
                    >
                      <Settings className="w-6 h-6" />
                      Admin Dashboard
                    </Link>
                  )}
                                      <button
                      onClick={handleLogoutWithDesktopClose}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors w-full text-left text-red-600"
                    >
                      <LogOut className="w-6 h-6" />
                      Sign out
                    </button>
                </div>
              </div>
            )}

            {/* Guest Sign In */}
            {!isAuthenticated && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Account
                </h3>
                <Button
                  asChild
                  variant="outline"
                  className="w-full flex items-center gap-3 hover:bg-red-50 hover:border-red-300 transition-colors"
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

            {/* Quick Links Section */}
            <div className="mb-8">
                              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Liên kết nhanh
                </h3>
              <div className="space-y-2">
                <Link
                  href="/products?category=refined"
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  onClick={() => setDesktopSidebarOpen(false)}
                >
                  <Star className="w-5 h-5 text-yellow-500" />
                  Refined Bird&apos;s Nest
                </Link>
                <Link
                  href="/products?category=raw"
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  onClick={() => setDesktopSidebarOpen(false)}
                >
                  <Package className="w-5 h-5 text-blue-500" />
                  Raw Bird&apos;s Nest
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  onClick={() => setDesktopSidebarOpen(false)}
                >
                  <HelpCircle className="w-5 h-5 text-green-500" />
                  Customer Support
                </Link>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Mobile Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mt-16 animate-in slide-in-from-top-4 duration-300">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Search</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSearch(false)}
                  aria-label="Close search"
                  className="hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
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
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    autoFocus
                    aria-label="Search products"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
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
