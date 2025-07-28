"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose, DrawerTitle } from "@/components/ui/drawer";
import { Search, User, Menu, X, LayoutDashboard, User2, ShoppingBag, LogOut, Heart, Bell, Box, Users, Settings, Home as HomeIcon, Info, Mail } from "lucide-react";
import { CartIconWithBadge } from "@/components/CartIconWithBadge";
import { useState, useRef } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Avatar as ShadcnAvatar } from "@/components/ui/avatar";
import { LogIn } from "lucide-react";
import useSWR from "swr";
import { api } from "@/lib/api";

export function MainNavbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const pathname = usePathname();
  const userFromSession = session?.user;
  const { data: user } = useSWR(userFromSession ? "/v1/users/profile" : null, url => api.get(url.replace('/v1', '')), { fallbackData: userFromSession });

  // --- Notification dropdown state and mock data ---
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New order received!", read: false, time: "2m ago" },
    { id: 2, text: "Stock low: Raw Birdnest 50g", read: false, time: "10m ago" },
    { id: 3, text: "Order #1234 marked as shipped", read: true, time: "1h ago" },
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;
  function markAllRead() {
    setNotifications(n => n.map(notif => ({ ...notif, read: true })));
  }
  function clearNotifications() {
    setNotifications([]);
  }

  return (
    <header className="w-full border-b backdrop-blur sticky top-0 z-30">
      <div className="w-full bg-white px-4 lg:px-6 xl:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-20">
            {/* Left: Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 text-xl md:text-2xl font-bold tracking-wide" style={{ color: '#C10008' }}>
                <Image src="/images/logo.png" alt="Yến Sào Kim Sang Logo" width={36} height={36} className="logo-img md:w-10 md:h-10 w-9 h-9 border-2 border-yellow-400 rounded-full" />
                <span className="hidden md:inline">Yến Sào Kim Sang</span>
              </Link>
            </div>

            {/* Middle: Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8 text-lg">
              <Link href="/" className="hover:text-yellow-600 transition-colors duration-200 font-medium">Home</Link>
              <Link href="/products" className="hover:text-yellow-600 transition-colors duration-200 font-medium">Products</Link>
              <Link href="/about" className="hover:text-yellow-600 transition-colors duration-200 font-medium">About</Link>
              <Link href="/contact" className="hover:text-yellow-600 transition-colors duration-200 font-medium">Contact</Link>
            </nav>

            {/* Right: Search, Icons, and User Info */}
            <div className="flex items-center gap-3 md:gap-4">
            {/* Search Icon (mobile) */}
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search" onClick={() => setShowSearch(true)}>
              <Search className="w-5 h-5 text-gray-500" />
            </Button>
            {/* Search Bar (desktop) */}
            <form
              action="#"
              method="get"
              className="hidden md:flex flex-1 mx-4 max-w-xs items-center"
              onSubmit={e => { e.preventDefault(); }}
            >
              <input
                type="text"
                name="query"
                placeholder="Search..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
              />
              <Button type="submit" size="icon" variant="ghost" className="ml-2">
                <Search className="w-5 h-5 text-gray-500" />
              </Button>
            </form>
            {/* Cart Icon */}
            <CartIconWithBadge />
            {/* Notification Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-full hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-red-500 focus:outline-none" aria-label="Notifications">
                  <Bell className="w-5 h-5 text-gray-500" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-w-xs p-2 rounded-xl shadow-lg">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="font-semibold text-base">Notifications</span>
                  {notifications.length > 0 && (
                    <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline focus:outline-none">Mark all as read</button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800">
                  {notifications.length === 0 ? (
                    <div className="text-center text-gray-400 py-6">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`flex items-start gap-2 px-2 py-3 ${n.read ? "bg-white dark:bg-neutral-800" : "bg-red-50 dark:bg-red-900"}`}>
                        <span className={`w-2 h-2 rounded-full mt-2 ${n.read ? "bg-gray-300" : "bg-red-600"}`} />
                        <div className="flex-1">
                          <div className="text-sm text-gray-800 dark:text-gray-100">{n.text}</div>
                          <div className="text-xs text-gray-400 mt-1">{n.time}</div>
                        </div>
                        {!n.read && (
                          <button onClick={() => setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, read: true } : notif))} className="text-xs text-blue-600 hover:underline focus:outline-none">Mark read</button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <button onClick={clearNotifications} className="w-full mt-2 py-1 rounded bg-gray-100 dark:bg-neutral-700 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-neutral-600 focus-visible:ring-2 focus-visible:ring-red-500 focus:outline-none">Clear all</button>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* User/Profile */}
            <div className="flex items-center gap-2">
              {!session ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-base border border-gray-300 shadow-sm hover:bg-gray-100 transition"
                >
                  <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`} aria-label="Sign In">
                    <LogIn className="w-5 h-5" />
                    <span className="hidden sm:inline">Sign in</span>
                  </Link>
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label="User menu"
                      className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted transition min-w-0"
                    >
                      <span className="block md:hidden">
                        <ShadcnAvatar
                          src={user?.image || "/images/user.jpeg"}
                          name={user?.name}
                          size={32}
                          className="shadow border border-gray-200"
                        />
                      </span>
                      <span className="hidden md:flex items-center gap-3 min-w-0">
                        <ShadcnAvatar
                          src={user?.image || "/images/user.jpeg"}
                          name={user?.name}
                          size={36}
                          className="w-9 h-9 shadow border border-gray-200"
                        />
                        <div className="flex flex-col leading-tight break-words max-w-[180px] text-left">
                          <span className="font-medium">{user?.name}</span>
                          {user?.bio && (
                            <span className="text-sm text-muted-foreground break-words">{user.bio}</span>
                          )}
                        </div>
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg p-2">
                    <DropdownMenuItem asChild className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-primary/10 focus:bg-primary/20 transition">
                      <Link href="/dashboard/profile">
                        <User2 className="w-4 h-4" />
                        <span className="i18n-profile">My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-primary/10 focus:bg-primary/20 transition">
                      <Link href="/dashboard/orders">
                        <ShoppingBag className="w-4 h-4" />
                        <span className="i18n-orders">Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-primary/10 focus:bg-primary/20 transition">
                      <Link href="/dashboard/wishlist">
                        <Heart className="w-4 h-4" />
                        <span className="i18n-wishlist">Wishlist</span>
                      </Link>
                    </DropdownMenuItem>
                    {session && (session.user && session.user.isAdmin) && (
                      <DropdownMenuItem asChild className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-primary/10 focus:bg-primary/20 transition">
                        <Link href="/admin">
                          <LayoutDashboard className="w-4 h-4" />
                          <span className="i18n-admin-dashboard">Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => { signOut(); }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 focus:bg-red-100 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="i18n-logout">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {/* Hamburger menu (mobile, top right) */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="left">
              <DrawerTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu">
                  <Menu className="w-6 h-6" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="p-0 w-64 max-w-[90vw]">
                <DrawerTitle className="sr-only">Main Navigation</DrawerTitle>
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-wide" style={{ color: '#C10008' }} onClick={() => setDrawerOpen(false)}>
                                  <Image src="/images/logo.png" alt="Yến Sào Kim Sang Logo" width={32} height={32} className="border-2 border-yellow-400 rounded-full" />
              Yến Sào Kim Sang
                  </Link>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" aria-label="Close menu">
                      <X className="w-6 h-6" />
                    </Button>
                  </DrawerClose>
                </div>
                <nav className="flex flex-col gap-2 px-4 py-4 text-lg">
                  <Link href="/" className="hover:text-yellow-600 transition py-2 flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                    <HomeIcon className="w-5 h-5" /> Home
                  </Link>
                  <Link href="/products" className="hover:text-yellow-600 transition py-2 flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                    <Box className="w-5 h-5" /> Products
                  </Link>
                  <Link href="/about" className="hover:text-yellow-600 transition py-2 flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                    <Info className="w-5 h-5" /> About
                  </Link>
                  <Link href="/contact" className="hover:text-yellow-600 transition py-2 flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                    <Mail className="w-5 h-5" /> Contact
                  </Link>
                  {!session && <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`} className="hover:text-yellow-600 transition py-2 flex items-center gap-2" onClick={() => setDrawerOpen(false)}><LogIn className="w-5 h-5" /> Login</Link>}
                  {!session && <Link href="/signup" className="hover:text-yellow-600 transition py-2 flex items-center gap-2" onClick={() => setDrawerOpen(false)}><User className="w-5 h-5" /> Sign up</Link>}
                  {session && <Link href="/dashboard" className="hover:text-yellow-600 transition py-2 flex items-center gap-2" onClick={() => setDrawerOpen(false)}><LayoutDashboard className="w-5 h-5" /> Dashboard</Link>}
                  {session && <button onClick={() => { setDrawerOpen(false); signOut(); }} className="text-left py-2 hover:text-yellow-600 transition w-full flex items-center gap-2"><LogOut className="w-5 h-5" /> <span>Sign out</span></button>}
                </nav>
                {/* Admin section if user is admin */}
                {session && session.user && session.user.isAdmin && (
                  <>
                    <div className="my-2 border-t" />
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</div>
                    <nav className="flex flex-col gap-2 px-4 pb-4 text-lg">
                      <Link href="/admin" className="hover:text-red-600 transition py-2 flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                      </Link>
                      <Link href="/admin/orders" className="hover:text-red-600 transition py-2 flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                        <ShoppingBag className="w-5 h-5" /> Orders
                      </Link>
                      <Link href="/admin/products" className="hover:text-red-600 transition py-2 flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                        <Box className="w-5 h-5" /> Products
                      </Link>
                      <Link href="/admin/users" className="hover:text-red-600 transition py-2 flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                        <Users className="w-5 h-5" /> Customers
                      </Link>
                      <Link href="/admin/settings" className="hover:text-red-600 transition py-2 flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                        <Settings className="w-5 h-5" /> Settings
                      </Link>
                    </nav>
                  </>
                )}
              </DrawerContent>
            </Drawer>
          </div>
            </div>
          </div>
      {/* Mobile Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center">
          <div className="bg-white rounded-lg shadow-lg mt-16 w-[95vw] max-w-md p-4 flex gap-2">
            <input
              ref={searchInputRef}
              type="text"
              name="query"
              placeholder="Search..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
            />
            <Button type="button" variant="outline" onClick={() => setShowSearch(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
      {/* Removed admin FAB and drawer as requested */}
    </header>
  );
} 