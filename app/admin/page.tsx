"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

function DashboardWidgets() {
  // Mock data for demonstration
  const totalRevenue = 125000000;
  const totalOrders = 320;
  const totalCustomers = 180;
  const avgOrderValue = totalRevenue / totalOrders;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
        <span className="text-gray-500 text-sm mb-2">Total Revenue</span>
        <span className="text-2xl font-bold text-green-600">₫{totalRevenue.toLocaleString()}</span>
      </div>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
        <span className="text-gray-500 text-sm mb-2">Total Orders</span>
        <span className="text-2xl font-bold text-blue-600">{totalOrders}</span>
      </div>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
        <span className="text-gray-500 text-sm mb-2">Total Customers</span>
        <span className="text-2xl font-bold text-yellow-600">{totalCustomers}</span>
      </div>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
        <span className="text-gray-500 text-sm mb-2">Avg. Order Value</span>
        <span className="text-2xl font-bold text-purple-600">₫{avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/admin");
    } else if (status === "authenticated" && !(session?.user && session.user.isAdmin)) {
      router.replace("/unauthorized");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <div className="flex-1 flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!session || !(session.user && session.user.isAdmin)) return null;

  return (
    <div className="flex flex-col items-center justify-center h-full py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard Overview</h1>
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <DashboardWidgets />
      </Suspense>
      {/* More analytics and tables will go here */}
    </div>
  );
} 