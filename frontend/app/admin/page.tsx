'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  BarChart2,
  Loader,
  Download,
  FileText,
  Calendar,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useMemo } from 'react';
import { formatVND, formatDate, statusColor } from '@/lib/order-utils';
import { MoreHorizontal } from 'lucide-react';
import useSWR from 'swr/immutable';
import { apiService } from '@/lib/api';
import type { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import {
  BarChart,
  Bar,
  Tooltip as RechartsTooltip,
  Cell,
  PieChart,
  Pie,
  Cell as RechartsCell,
  Legend as RechartsLegend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import Papa from 'papaparse';
import 'jspdf-autotable';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import Image from 'next/image';

// Type for jsPDF with autoTable
interface JsPDFWithAutoTable {
  autoTable: (options: {
    head: string[][];
    body: string[][];
    startY: number;
    styles: { fontSize: number };
    headStyles: { fillColor: number[] };
  }) => void;
}

const FILTERS = [
  { label: 'Hàng ngày', value: 'daily', icon: Calendar },
  { label: 'Hàng tuần', value: 'weekly', icon: BarChart2 },
  { label: 'Hàng tháng', value: 'monthly', icon: Activity },
];

function groupOrders(orders: Order[], filter: string) {
  const map = new Map<string, number>();
  orders.forEach((order: Order) => {
    const date = new Date(order.createdAt);
    let key: string;
    if (filter === 'daily') {
      key = date.toISOString().slice(0, 10);
    } else if (filter === 'weekly') {
      const week = `${date.getFullYear()}-W${Math.ceil((date.getDate() - date.getDay() + 1) / 7)}`;
      key = week;
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    map.set(key, (map.get(key) || 0) + parseFloat(order.total));
  });
  return Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue }));
}

// --- Export helpers for tables ---
function exportOrdersCSV(data: Order[]) {
  const rows = data.map((o) => ({
    ID: o.id,
    Customer: o.user?.name || 'Unknown',
    Total: o.total,
    Status: o.status,
    Date: format(parseISO(o.createdAt), 'yyyy-MM-dd HH:mm'),
  }));
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportOrdersPDF(data: Order[]) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  const tableData = data.map((o) => [
    o.id,
    o.user?.name || 'Unknown',
    o.total,
    o.status,
    format(parseISO(o.createdAt), 'yyyy-MM-dd HH:mm'),
  ]);
  
  (doc as unknown as JsPDFWithAutoTable).autoTable({
    head: [['ID', 'Customer', 'Total', 'Status', 'Date']],
    body: tableData,
    startY: 20,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  doc.save(`orders-${Date.now()}.pdf`);
}

function exportLowStockCSV(data: Product[]) {
  const rows = data.map((p) => ({
    Name: p.name,
    Stock: p.quantity,
    Price: p.price,
    Category: p.category.name,
  }));
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `low-stock-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportLowStockPDF(data: Product[]) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  const tableData = data.map((p) => [
    p.name,
    p.quantity.toString(),
    p.price,
    p.category.name,
  ]);
  
  (doc as unknown as JsPDFWithAutoTable).autoTable({
    head: [['Name', 'Stock', 'Price', 'Category']],
    body: tableData,
    startY: 20,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [239, 68, 68] },
  });
  
  doc.save(`low-stock-${Date.now()}.pdf`);
}

function exportTopProductsCSV(
  data: {
    name: string;
    unitsSold: number;
    revenue: number;
    stock: number;
    image: string;
  }[],
) {
  const rows = data.map((p) => ({
    Name: p.name,
    'Units Sold': p.unitsSold,
    Revenue: p.revenue,
    Stock: p.stock,
  }));
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `top-products-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportTopProductsPDF(
  data: {
    name: string;
    unitsSold: number;
    revenue: number;
    stock: number;
    image: string;
  }[],
) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  const tableData = data.map((p) => [
    p.name,
    p.unitsSold.toString(),
    p.revenue.toString(),
    p.stock.toString(),
  ]);
  
  (doc as unknown as JsPDFWithAutoTable).autoTable({
    head: [['Name', 'Units Sold', 'Revenue', 'Stock']],
    body: tableData,
    startY: 20,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [34, 197, 94] },
  });
  
  doc.save(`top-products-${Date.now()}.pdf`);
}

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('daily');
  const [isExporting, setIsExporting] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      router.push('/login?callbackUrl=/admin');
      return;
    }

    try {
      const userData = JSON.parse(user);
      
      if (!userData.isAdmin) {
        router.push('/login?callbackUrl=/admin');
        return;
      }
    } catch (error) {
      router.push('/login?callbackUrl=/admin');
      return;
    }
  }, [router]);

  // Fetch data using apiService
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useSWR(
    'admin-orders', 
    () => apiService.getOrders()
  );
  const { data: products, isLoading: productsLoading, error: productsError } = useSWR(
    'admin-products', 
    () => apiService.getProducts()
  );
  const { data: users, isLoading: usersLoading, error: usersError } = useSWR(
    'admin-users', 
    () => apiService.getUsers()
  );

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!orders || !products || !users) return null;

    const totalRevenue = orders.reduce((sum: number, order: Order) => sum + parseFloat(order.total), 0);
    const totalOrders = orders.length;
    const totalCustomers = users.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate growth (mock data for now)
    const previousRevenue = totalRevenue * 0.85; // 15% growth
    const revenueGrowth = ((totalRevenue - previousRevenue) / previousRevenue) * 100;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      avgOrderValue,
      revenueGrowth,
    };
  }, [orders, products, users]);

  // Process chart data
  const chartData = useMemo(() => {
    if (!orders) return [];
    return groupOrders(orders, selectedFilter);
  }, [orders, selectedFilter]);

  // Status distribution
  const statusDistribution = useMemo(() => {
    if (!orders) return [];
    const statusCount = orders.reduce((acc: Record<string, number>, order: Order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(statusCount).map(([status, count]) => ({ status, count }));
  }, [orders]);

  // Low stock products
  const lowStockProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p: Product) => p.quantity < 10).slice(0, 5);
  }, [products]);

  // Top products (mock data)
  const topProducts = useMemo(() => {
    if (!products) return [];
    return products.slice(0, 5).map((p: Product) => ({
      name: p.name,
      unitsSold: Math.floor(Math.random() * 100) + 10,
      revenue: Math.floor(Math.random() * 10000000) + 1000000,
      stock: p.quantity,
      image: p.images?.[0]?.url || '/images/placeholder.png',
    }));
  }, [products]);

  // Recent orders
  const recentOrders = useMemo(() => {
    if (!orders) return [];
    return orders.slice(0, 5);
  }, [orders]);

  // Export handlers
  const handleExportCSV = () => {
    if (!orders) return;
    setIsExporting(true);
    try {
      exportOrdersCSV(orders);
      toast({
        title: "Export successful",
        description: "Orders data exported as CSV",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export orders data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!orders) return;
    setIsExporting(true);
    try {
      await exportOrdersPDF(orders);
      toast({
        title: "Export successful",
        description: "Orders data exported as PDF",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export orders data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle errors
  const hasError = ordersError || productsError || usersError;
  const isLoading = ordersLoading || productsLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError || !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-red-600">Lỗi tải Dashboard</h3>
              <p className="text-gray-600 mb-4">
                {hasError ? 'Không thể tải dữ liệu dashboard từ máy chủ' : 'Không có dữ liệu khả dụng'}
              </p>
              <div className="space-y-2">
                <Button onClick={() => window.location.reload()} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Thử lại
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/login?callbackUrl=/admin')} 
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Kiểm tra xác thực
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BarChart2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
                  <p className="text-gray-600 mt-1">
                    Tổng quan hiệu suất và phân tích cửa hàng của bạn
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Dữ liệu trực tiếp
                </Badge>
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                    <p className="text-2xl font-bold text-gray-900">{formatVND(metrics.totalRevenue)}</p>
                    <div className="flex items-center mt-2">
                      {metrics.revenueGrowth > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm ${metrics.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(metrics.revenueGrowth).toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-500 ml-1">so với kỳ trước</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalOrders}</p>
                    <p className="text-sm text-gray-500 mt-2">Tất cả đơn hàng</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <ShoppingBag className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng khách hàng</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalCustomers}</p>
                    <p className="text-sm text-gray-500 mt-2">Người dùng đã đăng ký</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Giá trị đơn hàng trung bình</p>
                    <p className="text-2xl font-bold text-gray-900">{formatVND(metrics.avgOrderValue)}</p>
                    <p className="text-sm text-gray-500 mt-2">Mỗi đơn hàng</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Target className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Xu hướng doanh thu</CardTitle>
                    <CardDescription>Doanh thu theo thời gian</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {FILTERS.map((filter) => {
                      const Icon = filter.icon;
                      return (
                        <Button
                          key={filter.value}
                          variant={selectedFilter === filter.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedFilter(filter.value)}
                          className="flex items-center gap-1"
                        >
                          <Icon className="w-3 h-3" />
                          {filter.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatVND(value as number), 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Current order status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {statusDistribution.map((entry, index) => (
                        <RechartsCell key={`cell-${index}`} fill={statusColor[entry.status] || '#8884d8'} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <RechartsLegend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest order activity</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={isExporting}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order: Order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{order.id}</p>
                          <p className="text-xs text-gray-500">{order.user?.name || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatVND(parseFloat(order.total))}</p>
                        <Badge variant="secondary" className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Low Stock Alert</CardTitle>
                    <CardDescription>Products running low on stock</CardDescription>
                  </div>
                  <Badge className="bg-red-100 text-red-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {lowStockProducts.length} items
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowStockProducts.map((product: Product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.category.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatVND(parseFloat(product.price))}</p>
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          Stock: {product.quantity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Best selling products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">#{index + 1} Top Seller</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Units Sold:</span>
                        <span className="font-medium">{product.unitsSold}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Revenue:</span>
                        <span className="font-medium">{formatVND(product.revenue)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Stock:</span>
                        <span className="font-medium">{product.stock}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
