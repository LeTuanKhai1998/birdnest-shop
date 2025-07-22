import React from "react";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, ShoppingCart, Search, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CurrentYear from "@/components/CurrentYear";
import Footer from "@/components/Footer";
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
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-red-700 tracking-wide">
            <Image src="/images/logo.png" alt="Birdnest Shop Logo" width={40} height={40} />
            Birdnest Shop
          </Link>
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
      <Footer />
    </div>
  );
}
