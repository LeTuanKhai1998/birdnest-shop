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
} from 'lucide-react';
import { CartIconWithBadge } from '@/components/CartIconWithBadge';
import { NotificationBell } from '@/components/NotificationBell';
import { useState, useRef } from 'react';
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
import useSWR from 'swr';

export function ResponsiveNavbar() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const pathname = usePathname();
  const userFromSession = session?.user;
  
  // Use session data directly instead of fetching from backend
  const user = userFromSession;

  return (
    <>
      {/* Full-width background container */}
      <div className="w-full bg-[#fdf6ef] border-b border-gray-200 shadow-sm sticky top-0 z-50">
        {/* Content container */}
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 lg:h-20 px-4 lg:px-6 xl:px-8">
            {/* Left: Hamburger Menu (Desktop) + Logo and Brand Name */}
            <div className="flex items-center gap-4">
              {/* Desktop Hamburger Menu */}
              <div className="hidden lg:block">
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setDesktopSidebarOpen(true)}
                  aria-label="Open sidebar menu"
                  aria-expanded={desktopSidebarOpen}
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </div>

              {/* Logo and Brand Name */}
              <div className="flex items-center flex-shrink-0">
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="relative">
                    <Image
                      src="/images/logo.png"
                      alt="Yến Sào Kim Sang Logo"
                      width={40}
                      height={40}
                      className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-yellow-400 rounded-full transition-transform group-hover:scale-105"
                    />
                  </div>
                  {/* Hide shop name on small screens */}
                  <span className="hidden sm:block text-lg lg:text-xl font-bold text-red-700 tracking-wide group-hover:text-red-800 transition-colors">
                    Yến Sào Kim Sang
                  </span>
                </Link>
              </div>
            </div>

            {/* Middle: Desktop Navigation Links (Hidden on desktop, shown on tablet) */}
            <nav className="hidden md:flex lg:hidden items-center space-x-6">
              <Link
                href="/"
                className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-200 relative group px-2 py-1"
              >
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                href="/products"
                className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-200 relative group px-2 py-1"
              >
                Products
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-200 relative group px-2 py-1"
              >
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-200 relative group px-2 py-1"
              >
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                href="/guest-orders"
                className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-200 relative group px-2 py-1"
              >
                Track Order
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Right: Search, Icons, User */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Search - Desktop */}
              <div className="hidden md:flex items-center">
                <form
                  className="relative"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-56 lg:w-72 pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    aria-label="Search products"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                    aria-label="Submit search"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Search - Mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden p-2"
                onClick={() => setShowSearch(true)}
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Cart */}
              <div className="relative">
                <CartIconWithBadge />
              </div>

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <div className="flex items-center">
                {!session ? (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex items-center gap-2"
                  >
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign in</span>
                    </Link>
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 p-2"
                      >
                        <ShadcnAvatar
                          src={user?.image || '/images/user.jpeg'}
                          name={user?.name}
                          size={32}
                          className="w-8 h-8"
                        />
                        <span className="hidden lg:block text-sm font-medium">
                          {user?.name}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="p-2 border-b">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <DropdownMenuItem onClick={() => window.location.href = '/dashboard/profile'}>
                        <User className="w-4 h-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = '/dashboard/orders'}>
                        <ShoppingBag className="w-4 h-4" />
                        Orders
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = '/dashboard/wishlist'}>
                        <Heart className="w-4 h-4" />
                        Wishlist
                      </DropdownMenuItem>
                      {session.user?.isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => window.location.href = '/admin'}>
                            <Settings className="w-4 h-4" />
                            Admin Dashboard
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => signOut()}
                        className="flex items-center gap-2 text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Mobile Menu Button */}
              <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
                <DrawerTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    aria-label="Open menu"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="w-80 p-0">
                  <DrawerTitle className="sr-only">Navigation Menu</DrawerTitle>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-6">
                      <Link
                        href="/"
                        className="flex items-center gap-2"
                        onClick={() => setSheetOpen(false)}
                      >
                        <Image
                          src="/images/logo.png"
                          alt="Logo"
                          width={32}
                          height={32}
                          className="border-2 border-yellow-400 rounded-full"
                        />
                        <span className="font-bold text-red-700">
                          Yến Sào Kim Sang
                        </span>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSheetOpen(false)}
                        aria-label="Close menu"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Mobile Search */}
                    <div className="mb-6">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          setSheetOpen(false);
                        }}
                      >
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            aria-label="Search products"
                          />
                          <button
                            type="submit"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600"
                            aria-label="Submit search"
                          >
                            <Search className="w-5 h-5" />
                          </button>
                        </div>
                      </form>
                    </div>

                    <nav className="space-y-1">
                      <Link
                        href="/"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => setSheetOpen(false)}
                      >
                        <HomeIcon className="w-5 h-5" />
                        Home
                      </Link>
                      <Link
                        href="/products"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => setSheetOpen(false)}
                      >
                        <Box className="w-5 h-5" />
                        Products
                      </Link>
                      <Link
                        href="/about"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => setSheetOpen(false)}
                      >
                        <Info className="w-5 h-5" />
                        About
                      </Link>
                      <Link
                        href="/contact"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => setSheetOpen(false)}
                      >
                        <Mail className="w-5 h-5" />
                        Contact
                      </Link>
                      <Link
                        href="/guest-orders"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => setSheetOpen(false)}
                      >
                        <Search className="w-5 h-5" />
                        Track Order
                      </Link>
                    </nav>

                    {session && (
                      <>
                        <div className="border-t my-4" />
                        <div className="space-y-1">
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setSheetOpen(false)}
                          >
                            <User className="w-5 h-5" />
                            Dashboard
                          </Link>
                          {session.user?.isAdmin && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                              onClick={() => setSheetOpen(false)}
                            >
                              <Settings className="w-5 h-5" />
                              Admin
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              setSheetOpen(false);
                              signOut();
                            }}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors w-full text-left text-red-600"
                          >
                            <LogOut className="w-5 h-5" />
                            Sign out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <Drawer open={desktopSidebarOpen} onOpenChange={setDesktopSidebarOpen}>
        <DrawerContent className="w-80 p-0 h-full max-h-screen">
          <DrawerTitle className="sr-only">Desktop Navigation Menu</DrawerTitle>
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/"
                className="flex items-center gap-3"
                onClick={() => setDesktopSidebarOpen(false)}
              >
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="border-2 border-yellow-400 rounded-full"
                />
                <span className="font-bold text-xl text-red-700">
                  Yến Sào Kim Sang
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDesktopSidebarOpen(false)}
                aria-label="Close sidebar"
                className="hover:bg-gray-100"
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
                    placeholder="Search products..."
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    aria-label="Search products"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600"
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
                Navigation
              </h3>
              <Link
                href="/"
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors text-lg"
                onClick={() => setDesktopSidebarOpen(false)}
              >
                <HomeIcon className="w-6 h-6" />
                Home
              </Link>
              <Link
                href="/products"
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors text-lg"
                onClick={() => setDesktopSidebarOpen(false)}
              >
                <Box className="w-6 h-6" />
                Products
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors text-lg"
                onClick={() => setDesktopSidebarOpen(false)}
              >
                <Info className="w-6 h-6" />
                About
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors text-lg"
                onClick={() => setDesktopSidebarOpen(false)}
              >
                <Mail className="w-6 h-6" />
                Contact
              </Link>
              <Link
                href="/guest-orders"
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors text-lg"
                onClick={() => setDesktopSidebarOpen(false)}
              >
                <Search className="w-6 h-6" />
                Track Order
              </Link>
            </nav>

            {/* User Section */}
            {session && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Account
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
                  {session.user?.isAdmin && (
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
                    onClick={() => {
                      setDesktopSidebarOpen(false);
                      signOut();
                    }}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors w-full text-left text-red-600"
                  >
                    <LogOut className="w-6 h-6" />
                    Sign out
                  </button>
                </div>
              </div>
            )}

            {/* Guest Sign In */}
            {!session && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Account
                </h3>
                <Button
                  asChild
                  variant="outline"
                  className="w-full flex items-center gap-3"
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
          </div>
        </DrawerContent>
      </Drawer>

      {/* Mobile Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mt-16">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Search</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSearch(false)}
                  aria-label="Close search"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600"
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
