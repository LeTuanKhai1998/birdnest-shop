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
      {/* Mobile Drawer Menu */}
      <Drawer>
        <DrawerTrigger asChild>
          <button className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow border border-gray-200" aria-label="Open menu">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </DrawerTrigger>
        <DrawerContent className="p-0">
          <nav className="flex flex-col gap-2 p-6">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-lg font-medium hover:bg-red-50 dark:hover:bg-neutral-700 transition",
                "text-gray-700 dark:text-gray-200"
              )}>
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            ))}
            <button className="mt-6 text-red-600 font-semibold flex items-center gap-2">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              Logout
            </button>
          </nav>
        </DrawerContent>
      </Drawer>
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