"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Trash2,
  Plus
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { dashboardApi } from "@/lib/api-service";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueData: Array<{ name: string; value: number }>;
  orderData: Array<{ name: string; orders: number }>;
  productData: Array<{ name: string; value: number }>;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    } else if (status === "authenticated" && !session?.user?.isAdmin) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For now, get admin token directly for testing
        let token = (session as any)?.accessToken || (session as any)?.token;
        
        if (!token) {
          // Try to get admin token directly
          try {
            const loginResponse = await fetch('http://localhost:8080/v1/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: 'admin@birdnest.com',
                password: 'admin123'
              })
            });
            
            if (loginResponse.ok) {
              const loginData = await loginResponse.json();
              token = loginData.data?.tokens?.access?.token || loginData.tokens?.access?.token;
            }
          } catch (loginErr) {
            console.error('Failed to get admin token:', loginErr);
          }
        }
        
        if (!token) {
          console.error('No access token available');
          setError('Authentication required');
          return;
        }
        
        const response = await dashboardApi.getDashboardStats(token);
        console.log('Dashboard response:', response);
        
        // Transform backend data to match frontend interface
        const backendData = response.data || response;
        const transformedData: DashboardData = {
          totalRevenue: backendData.totalRevenue || 0,
          totalOrders: backendData.totalOrders || 0,
          totalCustomers: backendData.totalCustomers || 0,
          averageOrderValue: backendData.averageOrderValue || 0,
          revenueData: [], // Will be populated from separate API call
          orderData: [], // Will be populated from separate API call
          productData: [] // Will be populated from separate API call
        };
        
        setDashboardData(transformedData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.user?.isAdmin) {
      fetchDashboardData();
    }
  }, [session, status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return null;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Use real data or fallback to empty data
  const data = dashboardData || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    revenueData: [],
    orderData: [],
    productData: []
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {session?.user?.name || session?.user?.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₫{data.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                Real-time data
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalOrders}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                Real-time data
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalCustomers}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                Real-time data
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₫{data.averageOrderValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                Real-time data
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {data.revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  No revenue data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Order Volume</CardTitle>
            </CardHeader>
            <CardContent>
              {data.orderData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.orderData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  No order data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Product Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {data.productData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.productData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.productData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No product data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}