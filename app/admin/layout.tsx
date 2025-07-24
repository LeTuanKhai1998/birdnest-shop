"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Users, BarChart2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: BarChart2 },
  { label: "Users", href: "/admin/users", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r shadow-sm py-8 px-4 sticky top-0 h-screen">
        <div className="mb-8 text-2xl font-bold tracking-tight text-red-700">Admin Panel</div>
        <nav className="flex flex-col gap-2">
          {adminNavItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg font-medium hover:bg-gray-100 transition",
                pathname === href ? "bg-primary/10 text-primary font-semibold" : "text-gray-700"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <button className="flex items-center gap-2 text-red-600 hover:text-red-800 transition font-medium">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
} 