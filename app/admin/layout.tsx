"use client";
import Link from "next/link";
import { ReactNode } from "react";
import { LayoutDashboard, ShoppingBag, Users, Settings, Sun, Moon, Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: LayoutDashboard },
  { href: "/admin/users", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-neutral-900">
      {/* Removed mobile Drawer Menu (hamburger) as requested */}
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-neutral-800 border-r border-gray-200 dark:border-neutral-700 py-6 px-4 gap-4 sticky top-0 h-screen z-20">
        <div className="mb-8 flex items-center gap-2 text-2xl font-bold text-red-700">
          <span>Admin</span>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium hover:bg-red-50 dark:hover:bg-neutral-700 transition",
              "text-gray-700 dark:text-gray-200"
            )}>
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-2">
          {/* Theme toggle placeholder */}
          <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 transition">
            <Sun className="w-5 h-5 hidden dark:inline" />
            <Moon className="w-5 h-5 dark:hidden" />
          </button>
        </div>
      </aside>
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 bg-gray-50 dark:bg-neutral-900 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
} 