import React from "react";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, ShoppingCart, Search, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CurrentYear from "@/components/CurrentYear";
// import { useSession } from "next-auth/react";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  // Placeholder cart count (replace with Zustand/localStorage logic)
  const cartCount = 2;
  // Placeholder session (replace with useSession from next-auth in client component)
  // const { data: session } = useSession();
  const session = null;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="w-full border-b bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto flex items-center justify-between py-4 px-2">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-red-700 tracking-wide">Birdnest Shop</Link>
          {/* Navigation */}
          <nav className="hidden md:flex gap-6 text-lg">
            <Link href="/" className="hover:text-yellow-600 transition">Home</Link>
            <Link href="/products" className="hover:text-yellow-600 transition">Products</Link>
            <Link href="/about" className="hover:text-yellow-600 transition">About</Link>
            <Link href="/contact" className="hover:text-yellow-600 transition">Contact</Link>
          </nav>
          {/* Search Bar */}
          <form
            action="/search"
            method="get"
            className="flex-1 mx-4 max-w-xs flex items-center"
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
          {/* Cart & User */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-red-700 transition" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                  {cartCount}
                </span>
              )}
            </Link>
            {/* User/Profile */}
            {session ? (
              <Button variant="ghost" size="icon" aria-label="User menu">
                <User className="w-6 h-6 text-gray-700" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" size="sm">Sign up</Button>
                </Link>
              </div>
            )}
            {/* Mobile Nav Toggle */}
            <div className="md:hidden">
              <Button variant="outline" size="icon" aria-label="Open menu">
                <span className="sr-only">Open menu</span>
                {/* Hamburger icon */}
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-2 py-6">{children}</main>
      {/* Footer */}
      <footer className="w-full border-t bg-white/90 py-6 mt-8">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-2">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-sm text-gray-700">
            <Link href="/policy" className="hover:text-red-700 transition">Purchase Policy</Link>
            <Link href="/delivery" className="hover:text-red-700 transition">Delivery</Link>
            <Link href="/return" className="hover:text-red-700 transition">Return & Exchange</Link>
          </div>
          <div className="flex gap-4 items-center">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook className="w-5 h-5 text-blue-600 hover:text-red-700 transition" />
            </a>
            <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" aria-label="Zalo">
              <Image src="/images/zalo-icon.png" alt="Zalo" width={20} height={20} className="w-5 h-5 hover:opacity-80 transition" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram className="w-5 h-5 text-pink-500 hover:text-red-700 transition" />
            </a>
          </div>
        </div>
        <div className="text-center text-xs text-gray-400 mt-4">&copy; <CurrentYear /> Birdnest Shop. All rights reserved.</div>
      </footer>
    </div>
  );
}
