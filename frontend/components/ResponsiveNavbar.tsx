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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const pathname = usePathname();
  const userFromSession = session?.user;
  const { data: user } = useSWR(
    userFromSession ? 'http://localhost:8080/api/users/profile' : null,
    (url) => fetch(url, { credentials: 'include' }).then((r) => r.json()),
    { fallbackData: userFromSession },
  );

  // Notification state
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New order received!', read: false, time: '2m ago' },
    {
      id: 2,
      text: 'Stock low: Raw Birdnest 50g',
      read: false,
      time: '10m ago',
    },
    {
      id: 3,
      text: 'Order #1234 marked as shipped',
      read: true,
      time: '1h ago',
    },
  ]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((n) => n.map((notif) => ({ ...notif, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <>
      {/* Full-width background container */}
      <div className="w-full bg-[#fdf6ef] border-b border-gray-200 shadow-sm sticky top-0 z-50">
        {/* Content container */}
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 lg:h-20 px-4 lg:px-6 xl:px-8">
            {/* Left: Logo and Brand Name */}
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

            {/* Middle: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative p-2"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Notifications</h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-4 border-b last:border-b-0 ${n.read ? 'bg-white' : 'bg-red-50'}`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.read ? 'bg-gray-300' : 'bg-red-600'}`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">{n.text}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {n.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-2 border-t">
                      <button
                        onClick={clearNotifications}
                        className="w-full py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

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
                    <DropdownMenuTrigger asChild>
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
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/profile"
                          className="flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/orders"
                          className="flex items-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/wishlist"
                          className="flex items-center gap-2"
                        >
                          <Heart className="w-4 h-4" />
                          Wishlist
                        </Link>
                      </DropdownMenuItem>
                      {session.user?.isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              href="/admin"
                              className="flex items-center gap-2"
                            >
                              <Settings className="w-4 h-4" />
                              Admin Dashboard
                            </Link>
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
