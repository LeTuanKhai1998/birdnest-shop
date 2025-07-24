"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { User, ListOrdered, MapPin, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Orders", href: "/dashboard/orders", icon: ListOrdered },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Addresses", href: "/dashboard/addresses", icon: MapPin },
  { label: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="flex-1 flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r shadow-sm py-8 px-4 sticky top-0 h-screen">
        <div className="mb-8 text-2xl font-bold tracking-tight">User Dashboard</div>
        <nav className="flex flex-col gap-2">
          {navItems.map(({ label, href, icon: Icon }) => (
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
      </aside>
      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t shadow flex justify-around items-center h-16 md:hidden">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full text-xs font-medium transition",
              pathname === href ? "text-primary" : "text-gray-600 hover:text-primary"
            )}
          >
            <Icon className="w-5 h-5 mb-1" />
            {label}
          </Link>
        ))}
      </nav>
      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
} 