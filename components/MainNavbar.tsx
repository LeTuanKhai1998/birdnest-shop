"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose, DrawerTitle } from "@/components/ui/drawer";
import { Search, User, Menu, X, LayoutDashboard, User2, ShoppingBag, LogOut } from "lucide-react";
import { CartIconWithBadge } from "@/components/CartIconWithBadge";
import { useState, useRef } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Avatar as ShadcnAvatar } from "@/components/ui/avatar";
import { LogIn } from "lucide-react";
import useSWR from "swr";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function MainNavbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const pathname = usePathname();
  const userFromSession = session?.user;
  const { data: user } = useSWR(userFromSession ? "/api/profile" : null, url => fetch(url).then(r => r.json()), { fallbackData: userFromSession });
  const firstName = user?.name?.split(" ")[0] || user?.name || "";

  return (
    <header className="w-full border-b bg-white/80 backdrop-blur sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between py-2 px-2 md:py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl md:text-2xl font-bold text-red-700 tracking-wide">
          <Image src="/images/logo.png" alt="Birdnest Shop Logo" width={36} height={36} className="logo-img md:w-10 md:h-10 w-9 h-9" />
          <span>Birdnest Shop</span>
        </Link>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 text-lg">
          <Link href="/" className="hover:text-yellow-600 transition">Home</Link>
          <Link href="/products" className="hover:text-yellow-600 transition">Products</Link>
          <Link href="/about" className="hover:text-yellow-600 transition">About</Link>
          <Link href="/contact" className="hover:text-yellow-600 transition">Contact</Link>
        </nav>
        {/* Right actions */}
        <div className="flex items-center gap-2 md:gap-4">
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
          {/* User/Profile */}
          <div className="flex items-center gap-2">
            {!session ? (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-xl p-2 flex flex-col items-center gap-1 text-sm font-medium hover:bg-muted transition"
              >
                <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`} aria-label="Sign In">
                  <LogIn className="w-5 h-5 mb-1" />
                  <span className="i18n-login">Sign in</span>
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
          {/* Hamburger menu (mobile) */}
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="left">
            <DrawerTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu" className="md:hidden">
                <Menu className="w-6 h-6" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="p-0 w-64 max-w-[90vw]">
              <DrawerTitle className="sr-only">Main Navigation</DrawerTitle>
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-red-700 tracking-wide" onClick={() => setDrawerOpen(false)}>
                  <Image src="/images/logo.png" alt="Birdnest Shop Logo" width={32} height={32} />
                  Birdnest Shop
                </Link>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" aria-label="Close menu">
                    <X className="w-6 h-6" />
                  </Button>
                </DrawerClose>
              </div>
              <nav className="flex flex-col gap-2 px-4 py-4 text-lg">
                <Link href="/" className="hover:text-yellow-600 transition py-2" onClick={() => setDrawerOpen(false)}>Home</Link>
                <Link href="/products" className="hover:text-yellow-600 transition py-2" onClick={() => setDrawerOpen(false)}>Products</Link>
                <Link href="/about" className="hover:text-yellow-600 transition py-2" onClick={() => setDrawerOpen(false)}>About</Link>
                <Link href="/contact" className="hover:text-yellow-600 transition py-2" onClick={() => setDrawerOpen(false)}>Contact</Link>
                {!session && <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`} className="hover:text-yellow-600 transition py-2" onClick={() => setDrawerOpen(false)}>Login</Link>}
                {!session && <Link href="/signup" className="hover:text-yellow-600 transition py-2" onClick={() => setDrawerOpen(false)}>Sign up</Link>}
                {session && <Link href="/dashboard" className="hover:text-yellow-600 transition py-2" onClick={() => setDrawerOpen(false)}>Dashboard</Link>}
                {session && <button onClick={() => { setDrawerOpen(false); signOut(); }} className="text-left py-2 hover:text-yellow-600 transition w-full">Sign out</button>}
              </nav>
            </DrawerContent>
          </Drawer>
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
    </header>
  );
} 