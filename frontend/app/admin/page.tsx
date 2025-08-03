'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart,
  BarChart3,
  Activity,
  Calendar,
  AlertTriangle,
  Download,
  RefreshCw,
  Eye,
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Info,
  Plus,
  Settings,
  Bell,
  Clock,
  Zap,
  BarChart,
  TrendingUp as TrendingUpIcon,
  UserCheck,
  ShoppingBag,
  CreditCard,
  MapPin,
  Star,
  CalendarDays,
  Clock3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { apiService } from '@/lib/api';
import { Order, Product } from '@/lib/types';
import { OrderId } from '@/components/ui/ReadableId';
import { getCategoryTextColor, getCategoryBgColor } from '@/lib/category-colors';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Papa from 'papaparse';
import { SmartImage } from '@/components/ui/SmartImage';
import {
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Utility functions
const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(amount);
};

const statusColor: Record<string, string> = {
  PENDING: '#fbbf24',
  PROCESSING: '#3b82f6',
  SHIPPED: '#8b5cf6',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444'
};

const FILTERS = [
  { label: 'Hàng ngày', value: 'daily', icon: Calendar },
  { label: 'Hàng tuần', value: 'weekly', icon: BarChart3 },
  { label: 'Hàng tháng', value: 'monthly', icon: Activity },
];

function groupOrders(orders: Order[], filter: string): Array<{date: string, revenue: number}> {
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
    const total = parseFloat(order.total) || 0;
    map.set(key, (map.get(key) || 0) + total);
  });
  return Array.from(map.entries()).map(([date, revenue]) => ({ 
    date, 
    revenue: isNaN(revenue) ? 0 : revenue 
  }));
}

// Export helpers
function exportLowStockCSV(data: Product[]) {
  const rows = data.map((p) => ({
    Name: p.name,
    Stock: p.quantity,
    Price: p.price,
    Category: p.category?.name || 'Unknown',
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selectedFilter, setSelectedFilter] = useState('daily');

  // Separate loading states for each section
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [recentOrdersLoading, setRecentOrdersLoading] = useState(true);
  const [lowStockLoading, setLowStockLoading] = useState(true);
  const [topProductsLoading, setTopProductsLoading] = useState(true);
  const [forecastsLoading, setForecastsLoading] = useState(true);

  // Load basic metrics first (fastest to load)
  const loadBasicMetrics = async () => {
    try {
      setMetricsLoading(true);
      const data = await apiService.getDashboardStats();
      setDashboardData((prev: any) => ({ ...prev, metrics: data.metrics }));
    } catch (err) {
      console.error('Error loading metrics:', err);
    } finally {
      setMetricsLoading(false);
    }
  };

  // Load recent orders
  const loadRecentOrders = async () => {
    try {
      setRecentOrdersLoading(true);
      const data = await apiService.getDashboardStats();
      setDashboardData((prev: any) => ({ ...prev, recentOrders: data.recentOrders }));
    } catch (err) {
      console.error('Error loading recent orders:', err);
    } finally {
      setRecentOrdersLoading(false);
    }
  };

  // Load low stock products
  const loadLowStockProducts = async () => {
    try {
      setLowStockLoading(true);
      const data = await apiService.getDashboardStats();
      setDashboardData((prev: any) => ({ ...prev, lowStockProducts: data.lowStockProducts }));
    } catch (err) {
      console.error('Error loading low stock products:', err);
    } finally {
      setLowStockLoading(false);
    }
  };

  // Load top products
  const loadTopProducts = async () => {
    try {
      setTopProductsLoading(true);
      const data = await apiService.getDashboardStats();
      setDashboardData((prev: any) => ({ ...prev, topProducts: data.topProducts }));
    } catch (err) {
      console.error('Error loading top products:', err);
    } finally {
      setTopProductsLoading(false);
    }
  };

  // Load forecasts (most complex, load last)
  const loadForecasts = async () => {
    try {
      setForecastsLoading(true);
      const data = await apiService.getDashboardStats();
      setDashboardData((prev: any) => ({ 
        ...prev, 
        forecasts: data.forecasts,
        trends: data.trends,
        marketIntelligence: data.marketIntelligence,
        riskAssessment: data.riskAssessment
      }));
    } catch (err) {
      console.error('Error loading forecasts:', err);
    } finally {
      setForecastsLoading(false);
    }
  };

  // Load all data (for refresh button)
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDashboardStats();
      setDashboardData(data);
      setLastRefresh(new Date());
      toast({
        title: "Tải dashboard thành công",
        description: "Dữ liệu dashboard đã được tải thành công.",
        variant: "success",
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      const errorMessage = 'Không thể tải dữ liệu dashboard. Vui lòng thử lại.';
      setError(errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data on mount with staggered loading
  useEffect(() => {
    // Load basic metrics first (immediate)
    loadBasicMetrics();
    
    // Load other sections with delays for better UX
    const timer1 = setTimeout(() => loadRecentOrders(), 200);
    const timer2 = setTimeout(() => loadLowStockProducts(), 400);
    const timer3 = setTimeout(() => loadTopProducts(), 600);
    const timer4 = setTimeout(() => loadForecasts(), 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadAllData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-product':
        router.push('/admin/products?action=add');
        break;
      case 'view-orders':
        router.push('/admin/orders');
        break;
      case 'manage-users':
        router.push('/admin/users');
        break;
      case 'settings':
        router.push('/admin/settings');
        break;
      default:
        break;
    }
  };

  // System alerts
  const systemAlerts = React.useMemo(() => {
    if (!dashboardData) return [];
    
    const alerts = [];
    
    // Low stock alert
    if (dashboardData?.metrics?.lowStockProducts > 0) {
      alerts.push({
        type: 'warning',
        title: 'Cảnh báo tồn kho thấp',
        message: `${dashboardData?.metrics?.lowStockProducts || 0} sản phẩm có tồn kho dưới 10`,
        icon: AlertTriangle,
        action: () => router.push('/admin/products?filter=low-stock')
      });
    }
    
    // No orders alert
    if (dashboardData?.metrics?.totalOrders === 0) {
      alerts.push({
        type: 'info',
        title: 'Chưa có đơn hàng',
        message: 'Cửa hàng chưa có đơn hàng nào. Hãy quảng cáo sản phẩm!',
        icon: Info,
        action: () => router.push('/admin/products')
      });
    }
    
    // High revenue alert
    if (dashboardData?.metrics?.revenueGrowth > 20) {
      alerts.push({
        type: 'success',
        title: 'Doanh thu tăng trưởng tốt',
        message: `Doanh thu tăng ${(dashboardData?.metrics?.revenueGrowth || 0).toFixed(1)}% so với kỳ trước`,
        icon: TrendingUp,
        action: () => router.push('/admin/orders')
      });
    }
    
    return alerts;
  }, [dashboardData, router]);

  // Process chart data
  const chartData = React.useMemo(() => {
    if (!dashboardData?.recentOrders || dashboardData.recentOrders.length === 0) return [];
    return groupOrders(dashboardData.recentOrders, selectedFilter);
  }, [dashboardData?.recentOrders, selectedFilter]);

  // Status distribution
  const statusDistribution = React.useMemo(() => {
    if (!dashboardData?.recentOrders || dashboardData.recentOrders.length === 0) return [];
    const statusCount = dashboardData.recentOrders.reduce((acc: Record<string, number>, order: Order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(statusCount).map(([name, value]) => ({
      name,
      value,
      fill: statusColor[name] || '#6b7280'
    }));
  }, [dashboardData?.recentOrders]);

  // Export functions
  const handleExportCSV = () => {
    if (!dashboardData?.recentOrders) {
      toast({
        title: "Lỗi",
        description: "Không có dữ liệu để xuất.",
        variant: "destructive",
      });
      return;
    }

    const csv = Papa.unparse(dashboardData.recentOrders.map((order: Order) => ({
      'Mã đơn hàng': order.id,
      'Khách hàng': order.user?.name || order.guestName || 'Khách',
      'Tổng tiền': formatVND(Number(order.total)),
      'Trạng thái': order.status,
      'Ngày tạo': format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm'),
    })));

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Xuất CSV thành công",
      description: "File CSV đã được tải xuống.",
      variant: "success",
    });
  };

  const handleExportLowStockCSV = () => {
    if (!dashboardData?.lowStockProducts) {
      toast({
        title: "Lỗi",
        description: "Không có dữ liệu để xuất.",
        variant: "destructive",
      });
      return;
    }

    const csv = Papa.unparse(dashboardData.lowStockProducts.map((product: Product) => ({
      'Tên sản phẩm': product.name,
      'Danh mục': product.category?.name || 'N/A',
      'Tồn kho': product.quantity || 0,
      'Giá': formatVND(Number(product.price)),
      'Trạng thái': (product.quantity || 0) > 0 ? 'Còn hàng' : 'Hết hàng',
    })));

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `low_stock_products_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Xuất CSV thành công",
      description: "File CSV đã được tải xuống.",
      variant: "success",
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading Header */}
        <div className="bg-[#a10000] text-white p-6 rounded-lg">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Bảng Điều Khiển</h1>
              <p className="text-white/80">Tổng quan hiệu suất và phân tích cửa hàng của bạn</p>
            </div>
          </div>
        </div>

        {/* Loading Status Cards - Optimized for mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Trạng thái hệ thống</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium text-blue-600">Đang tải...</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dữ liệu dashboard</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium text-green-600">Đang tải...</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Phiên bản</p>
                  <p className="text-sm font-medium">1.0.0</p>
                </div>
                <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ID cửa hàng</p>
                  <p className="text-sm font-medium">birdnest-shop</p>
                </div>
                <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading Content */}
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#a10000] rounded-full flex items-center justify-center mx-auto mb-6">
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-[#a10000] mb-2">Đang tải Dashboard</h2>
          <p className="text-gray-600 mb-6">Vui lòng chờ trong khi chúng tôi tải dữ liệu...</p>
          
          {/* Loading Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Tải dữ liệu cơ bản...</span>
              <span>{metricsLoading ? 'Đang tải...' : 'Hoàn thành'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className={`h-2 rounded-full transition-all duration-500 ${
                metricsLoading ? 'bg-blue-500 w-1/4' : 'bg-green-500 w-full'
              }`}></div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Tải đơn hàng gần đây...</span>
              <span>{recentOrdersLoading ? 'Đang tải...' : 'Hoàn thành'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className={`h-2 rounded-full transition-all duration-500 ${
                recentOrdersLoading ? 'bg-blue-500 w-1/2' : 'bg-green-500 w-full'
              }`}></div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Tải phân tích dự báo...</span>
              <span>{forecastsLoading ? 'Đang tải...' : 'Hoàn thành'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all duration-500 ${
                forecastsLoading ? 'bg-blue-500 w-3/4' : 'bg-green-500 w-full'
              }`}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="space-y-8">
        {/* Error Header */}
        <div className="bg-[#a10000] text-white p-6 rounded-lg">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Bảng Điều Khiển</h1>
              <p className="text-white/80">Tổng quan hiệu suất và phân tích cửa hàng của bạn</p>
            </div>
          </div>
        </div>

        {/* Error Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Trạng thái hệ thống</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <p className="text-sm font-medium text-red-600">Lỗi</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dữ liệu dashboard</p>
                  <p className="text-sm font-medium text-gray-500">Không</p>
                </div>
                <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Phiên bản</p>
                  <p className="text-sm font-medium">1.0.0</p>
                </div>
                <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ID cửa hàng</p>
                  <p className="text-sm font-medium">birdnest-shop</p>
                </div>
                <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Content - Enhanced mobile UX */}
        <div className="text-center py-12 md:py-16 px-6 md:px-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Không thể tải Dashboard</h2>
          <p className="text-gray-600 mb-6">Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.</p>
          
          <div className="space-y-3">
            <Button onClick={loadAllData} className="w-full max-w-xs">
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/settings')} className="w-full max-w-xs">
              <Settings className="w-4 h-4 mr-2" />
              Kiểm tra cài đặt
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Safe destructuring with null check
  const metrics = dashboardData?.metrics || {};
  const recentOrders = dashboardData?.recentOrders || [];
  const lowStockProducts = dashboardData?.lowStockProducts || [];
  const topProducts = dashboardData?.topProducts || [];
  const forecasts = dashboardData?.forecasts || {};
  const trends = dashboardData?.trends || {};
  const marketIntelligence = dashboardData?.marketIntelligence || {};
  const riskAssessment = dashboardData?.riskAssessment || {};

  return (
    <div className="space-y-8">
      {/* Key Metrics - Optimized for mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                {metricsLoading ? (
                  <Skeleton className="h-8 w-24 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardData?.metrics?.totalRevenue ? formatVND(dashboardData.metrics.totalRevenue) : '0 VND'}
                  </p>
                )}
                <p className="text-sm text-gray-500">Tổng doanh thu</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                {metricsLoading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardData?.metrics?.totalOrders || 0}
                  </p>
                )}
                <p className="text-sm text-gray-500">Tổng đơn hàng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                {metricsLoading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboardData?.metrics?.totalCustomers || 0}
                  </p>
                )}
                <p className="text-sm text-gray-500">Tổng khách hàng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-right">
                {metricsLoading ? (
                  <Skeleton className="h-8 w-20 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-orange-600">
                    {dashboardData?.metrics?.avgOrderValue ? formatVND(dashboardData.metrics.avgOrderValue) : '0 VND'}
                  </p>
                )}
                <p className="text-sm text-gray-500">Đơn hàng TB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6 text-center">
            <Button
              variant="outline"
              onClick={() => handleQuickAction('add-product')}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6 text-center">
            <Button
              variant="outline"
              onClick={() => handleQuickAction('view-orders')}
              className="w-full"
            >
              <Package className="w-4 h-4 mr-2" />
              Xem đơn hàng
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6 text-center">
            <Button
              variant="outline"
              onClick={() => handleQuickAction('manage-users')}
              className="w-full"
            >
              <Users className="w-4 h-4 mr-2" />
              Quản lý người dùng
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6 text-center">
            <Button
              variant="outline"
              onClick={() => handleQuickAction('settings')}
              className="w-full"
            >
              <Settings className="w-4 h-4 mr-2" />
              Cài đặt
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status and Refresh Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Cập nhật lần cuối: {lastRefresh.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600">Hệ thống hoạt động</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
                          onClick={loadAllData}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[#a10000] flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Thông báo hệ thống
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemAlerts.map((alert, index) => {
              const Icon = alert.icon;
              const alertColors = {
                warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
                info: 'border-blue-200 bg-blue-50 text-blue-800',
                success: 'border-green-200 bg-green-50 text-green-800'
              };
              
              return (
                <Card key={index} className={`hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-${alert.type === 'warning' ? 'yellow' : alert.type === 'info' ? 'blue' : 'green'}-500`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${alertColors[alert.type as keyof typeof alertColors]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{alert.message}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={alert.action}
                          className="text-xs h-6 px-2"
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts Section - Enhanced mobile responsiveness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Revenue Chart */}
        <Card className="hover:shadow-xl transition-all duration-300 rounded-2xl border-0 shadow-lg">
          <CardHeader className="pt-6 md:pt-8 px-6 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-[#a10000] text-lg md:text-xl">Xu hướng doanh thu</CardTitle>
                <CardDescription className="text-sm md:text-base">Doanh thu theo thời gian</CardDescription>
              </div>
              <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                {FILTERS.map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <Button
                      key={filter.value}
                      variant={selectedFilter === filter.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFilter(filter.value)}
                      className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
                    >
                      <Icon className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">{filter.label}</span>
                      <span className="sm:hidden">{filter.label.split(' ')[0]}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6 md:pb-8 px-6 md:px-8">
            {chartData.length > 0 ? (
              <div className="w-full h-[250px] md:h-[300px] lg:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatVND(value).replace('₫', '')}
                    />
                    <Tooltip 
                      formatter={(value) => [formatVND(value as number), 'Doanh thu']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#a10000" 
                      strokeWidth={3}
                      dot={{ fill: '#a10000', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#a10000', strokeWidth: 2, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="w-full h-[250px] md:h-[300px] lg:h-[350px] flex items-center justify-center bg-gray-50 dark:bg-neutral-800 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                    {metricsLoading ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu doanh thu'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 rounded-2xl border-0 shadow-lg">
          <CardHeader className="pt-6 md:pt-8 px-6 md:px-8">
            <CardTitle className="text-[#a10000] text-lg md:text-xl">Phân bố trạng thái đơn hàng</CardTitle>
            <CardDescription className="text-sm md:text-base">Phân bố trạng thái đơn hàng hiện tại</CardDescription>
          </CardHeader>
          <CardContent className="pb-6 md:pb-8 px-6 md:px-8">
            {statusDistribution.length > 0 ? (
              <div className="w-full h-[250px] md:h-[300px] lg:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={60}
                      innerRadius={20}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      wrapperStyle={{
                        fontSize: '12px',
                        paddingTop: '20px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="w-full h-[250px] md:h-[300px] lg:h-[350px] flex items-center justify-center bg-gray-50 dark:bg-neutral-800 rounded-lg">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                    {metricsLoading ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu phân bố'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables Section - Enhanced mobile layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Orders */}
        <Card className="hover:shadow-xl transition-all duration-300 rounded-2xl border-0 shadow-lg">
          <CardHeader className="pt-6 md:pt-8 px-6 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-[#a10000] text-lg md:text-xl">Đơn hàng gần đây</CardTitle>
                <CardDescription className="text-sm md:text-base">Hoạt động đơn hàng mới nhất</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Xuất CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="space-y-4">
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order: Order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <OrderId readableId={order.readableId} fallbackId={order.id} size="sm" />
                        <p className="text-xs text-gray-500">{order.user?.name || 'Không xác định'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatVND(parseFloat(order.total))}</p>
                      <Badge variant="secondary" className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Không có đơn hàng gần đây</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#a10000]">Cảnh báo tồn kho thấp</CardTitle>
                <CardDescription>Sản phẩm sắp hết hàng</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-800">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {lowStockProducts?.length || 0} sản phẩm
                </Badge>
                <Button variant="outline" size="sm" onClick={handleExportLowStockCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Xuất CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="space-y-4">
              {lowStockProducts && lowStockProducts.length > 0 ? (
                lowStockProducts.map((product: Product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full inline-block",
                          getCategoryBgColor(product.category?.name, product.category?.colorScheme),
                          getCategoryTextColor(product.category?.name, product.category?.colorScheme)
                        )}>
                          {product.category?.name || 'Không xác định'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatVND(parseFloat(product.price))}</p>
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        Tồn kho: {product.quantity}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tất cả sản phẩm đều có đủ tồn kho</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#a10000]">Sản phẩm bán chạy nhất</CardTitle>
              <CardDescription>Sản phẩm bán chạy theo doanh thu</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/admin/products')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Xem tất cả
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topProducts && topProducts.length > 0 ? (
              topProducts.map((product: Product, index: number) => {
                const firstImage = product.images?.[0];
                const imageUrl = typeof firstImage === 'string' 
                  ? firstImage 
                  : (firstImage as any)?.url || '/images/placeholder-image.svg';
                
                return (
                  <div key={product.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <SmartImage
                            src={imageUrl}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#a10000] text-white rounded-full flex items-center justify-center text-xs font-bold">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm group-hover:text-[#a10000] transition-colors">{product.name}</p>
                        <p className="text-xs text-gray-500">Bán chạy nhất</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Giá:</span>
                        <span className="font-medium">{formatVND(parseFloat(product.price))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tồn kho:</span>
                        <span className={`font-medium ${(product.quantity || 0) < 10 ? 'text-red-600' : 'text-green-600'}`}>
                          {product.quantity || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Danh mục:</span>
                        <span className="font-medium">{product.category?.name || 'Không xác định'}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/products/${product.id}`)}
                        className="w-full text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Không có dữ liệu sản phẩm</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pt-6">
          <CardTitle className="text-[#a10000] flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Hiệu suất hệ thống
          </CardTitle>
          <CardDescription>Thống kê hiệu suất và hoạt động hệ thống</CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-sm mb-1">Tỷ lệ chuyển đổi</h4>
              <p className="text-2xl font-bold text-blue-600">
                {dashboardData?.metrics?.totalCustomers > 0 
                  ? ((dashboardData.metrics.totalOrders / dashboardData.metrics.totalCustomers) * 100).toFixed(1)
                  : '0'}%
              </p>
              <p className="text-xs text-gray-500">Đơn hàng/Khách hàng</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-sm mb-1">Tăng trưởng</h4>
              <p className="text-2xl font-bold text-green-600">
                {dashboardData?.metrics?.revenueGrowth ? dashboardData.metrics.revenueGrowth.toFixed(1) : '0'}%
              </p>
              <p className="text-xs text-gray-500">So với kỳ trước</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-sm mb-1">Mục tiêu</h4>
              <p className="text-2xl font-bold text-purple-600">
                {dashboardData?.metrics?.totalRevenue ? Math.round(dashboardData.metrics.totalRevenue / 1000000) : '0'}M
              </p>
              <p className="text-xs text-gray-500">VND (tháng này)</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-medium text-sm mb-1">Thời gian phản hồi</h4>
              <p className="text-2xl font-bold text-orange-600">2.3s</p>
              <p className="text-xs text-gray-500">Trung bình</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Reports Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-[#a10000] flex items-center gap-2">
          <BarChart className="w-6 h-6" />
          Báo cáo chi tiết
        </h3>

        {/* Customer Analytics Report */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#a10000] flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Phân tích khách hàng
                </CardTitle>
                <CardDescription>Thống kê hành vi và phân tích khách hàng</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 md:mb-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Tổng khách hàng</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData?.metrics?.totalCustomers || 0}
                </p>
                <p className="text-xs text-gray-500">Đã đăng ký</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Khách hàng mới</h4>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData?.userStats?.newUsersLastMonth || 0}
                </p>
                <p className="text-xs text-gray-500">Tháng này</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Tỷ lệ mua hàng</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardData?.metrics?.totalCustomers > 0 
                    ? ((dashboardData.metrics.totalOrders / dashboardData.metrics.totalCustomers) * 100).toFixed(1)
                    : '0'}%
                </p>
                <p className="text-xs text-gray-500">Đã mua hàng</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Đánh giá TB</h4>
                <p className="text-2xl font-bold text-orange-600">4.2</p>
                <p className="text-xs text-gray-500">/ 5 sao</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Top khách hàng</h4>
                <div className="space-y-2">
                  {[1, 2, 3].map((rank) => (
                    <div key={rank} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#a10000] text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {rank}
                        </div>
                        <div>
                          <p className="font-medium text-sm">Khách hàng #{rank}</p>
                          <p className="text-xs text-gray-500">3 đơn hàng</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatVND(1500000)}</p>
                        <p className="text-xs text-gray-500">Tổng chi tiêu</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Phân bố địa lý</h4>
                <div className="space-y-2">
                  {[
                    { city: 'TP. Hồ Chí Minh', orders: 45, percentage: 45 },
                    { city: 'Hà Nội', orders: 30, percentage: 30 },
                    { city: 'Đà Nẵng', orders: 15, percentage: 15 },
                    { city: 'Khác', orders: 10, percentage: 10 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-sm">{item.city}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{item.orders} đơn</p>
                        <p className="text-xs text-gray-500">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory & Sales Report */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#a10000] flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Báo cáo tồn kho & Bán hàng
                </CardTitle>
                <CardDescription>Thống kê tồn kho và hiệu suất bán hàng</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Tổng sản phẩm</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData?.metrics?.totalProducts || 0}
                </p>
                <p className="text-xs text-gray-500">Đang bán</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Tồn kho thấp</h4>
                <p className="text-2xl font-bold text-red-600">
                  {dashboardData?.metrics?.lowStockProducts || 0}
                </p>
                <p className="text-xs text-gray-500">Cần bổ sung</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="w-6 h-6 text-yellow-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Hết hàng</h4>
                <p className="text-2xl font-bold text-yellow-600">
                  {dashboardData?.metrics?.outOfStockProducts || 0}
                </p>
                <p className="text-xs text-gray-500">Cần nhập</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUpIcon className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Tỷ lệ bán</h4>
                <p className="text-2xl font-bold text-green-600">78%</p>
                <p className="text-xs text-gray-500">Hiệu quả</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Danh mục bán chạy</h4>
                <div className="space-y-2">
                  {[
                    { category: 'Tổ yến tinh chế', sales: 45, revenue: 22500000 },
                    { category: 'Tổ yến thô', sales: 32, revenue: 16000000 },
                    { category: 'Tổ yến lông', sales: 28, revenue: 14000000 },
                    { category: 'Combo quà tặng', sales: 22, revenue: 11000000 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#a10000] text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.category}</p>
                          <p className="text-xs text-gray-500">{item.sales} đơn hàng</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatVND(item.revenue)}</p>
                        <p className="text-xs text-gray-500">Doanh thu</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Thời gian bán hàng</h4>
                <div className="space-y-2">
                  {[
                    { time: '9:00 - 12:00', orders: 25, percentage: 25 },
                    { time: '12:00 - 15:00', orders: 35, percentage: 35 },
                    { time: '15:00 - 18:00', orders: 30, percentage: 30 },
                    { time: '18:00 - 21:00', orders: 10, percentage: 10 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock3 className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-sm">{item.time}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{item.orders} đơn</p>
                        <p className="text-xs text-gray-500">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary Report */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#a10000] flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Báo cáo tài chính
                </CardTitle>
                <CardDescription>Tổng quan tài chính và dòng tiền</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Doanh thu tháng</h4>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData?.metrics?.totalRevenue ? formatVND(dashboardData.metrics.totalRevenue) : '0 VND'}
                </p>
                <p className="text-xs text-gray-500">Tổng cộng</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Tăng trưởng</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData?.metrics?.revenueGrowth ? dashboardData.metrics.revenueGrowth.toFixed(1) : '0'}%
                </p>
                <p className="text-xs text-gray-500">So với tháng trước</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Mục tiêu</h4>
                <p className="text-2xl font-bold text-purple-600">85%</p>
                <p className="text-xs text-gray-500">Đạt được</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Đơn hàng TB</h4>
                <p className="text-2xl font-bold text-orange-600">
                  {dashboardData?.metrics?.avgOrderValue ? formatVND(dashboardData.metrics.avgOrderValue) : '0 VND'}
                </p>
                <p className="text-xs text-gray-500">Mỗi đơn hàng</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Phương thức thanh toán</h4>
                <div className="space-y-2">
                  {[
                    { method: 'Chuyển khoản', orders: 45, percentage: 45 },
                    { method: 'Tiền mặt', orders: 30, percentage: 30 },
                    { method: 'Thẻ tín dụng', orders: 15, percentage: 15 },
                    { method: 'Ví điện tử', orders: 10, percentage: 10 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-sm">{item.method}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{item.orders} đơn</p>
                        <p className="text-xs text-gray-500">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Dự báo tháng tới</h4>
                <div className="space-y-2">
                  {[
                    { metric: 'Doanh thu dự kiến', value: '85,000,000 VND', trend: 'up' },
                    { metric: 'Đơn hàng dự kiến', value: '120 đơn', trend: 'up' },
                    { metric: 'Khách hàng mới', value: '25 người', trend: 'up' },
                    { metric: 'Tỷ lệ tăng trưởng', value: '12.5%', trend: 'up' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <TrendingUpIcon className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-sm">{item.metric}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{item.value}</p>
                        <p className="text-xs text-green-500">Tăng trưởng</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Forecasting & Trend Analysis */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#a10000] flex items-center gap-2">
                  <TrendingUpIcon className="w-5 h-5" />
                  Dự báo & Phân tích xu hướng
                </CardTitle>
                <CardDescription>Phân tích dự đoán và xu hướng kinh doanh</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Chọn khoảng thời gian
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Xuất báo cáo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            {/* AI-Powered Forecasts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-sm mb-1">Dự báo doanh thu</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData?.forecasts?.revenue?.forecast ? formatVND(dashboardData.forecasts.revenue.forecast) : '0 VND'}
                </p>
                <p className="text-xs text-blue-500">
                  Tháng tới ({dashboardData?.forecasts?.revenue?.growth ? dashboardData.forecasts.revenue.growth.toFixed(1) : '0'}%)
                </p>
                <div className="mt-2 text-xs text-gray-600">
                  <span className="inline-flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Độ tin cậy: {dashboardData?.forecasts?.revenue?.confidence ? Math.round(dashboardData.forecasts.revenue.confidence) : 0}%
                  </span>
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-sm mb-1">Dự báo khách hàng</h4>
                <p className="text-2xl font-bold text-green-600">
                  +{dashboardData?.forecasts?.customers?.forecast ? Math.round(dashboardData.forecasts.customers.forecast) : 0}
                </p>
                <p className="text-xs text-green-500">Khách hàng mới</p>
                <div className="mt-2 text-xs text-gray-600">
                  <span className="inline-flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Tăng {dashboardData?.forecasts?.customers?.growth ? dashboardData.forecasts.customers.growth.toFixed(1) : '0'}% so với tháng trước
                  </span>
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-sm mb-1">Dự báo đơn hàng</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardData?.forecasts?.orders?.forecast ? Math.round(dashboardData.forecasts.orders.forecast) : 0}
                </p>
                <p className="text-xs text-purple-500">Đơn hàng dự kiến</p>
                <div className="mt-2 text-xs text-gray-600">
                  <span className="inline-flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Tăng {dashboardData?.forecasts?.orders?.growth ? dashboardData.forecasts.orders.growth.toFixed(1) : '0'}% so với tháng trước
                  </span>
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-orange-100">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-sm mb-1">Chỉ số hiệu suất</h4>
                <p className="text-2xl font-bold text-orange-600">
                  {dashboardData?.forecasts?.performance ? dashboardData.forecasts.performance : 0}%
                </p>
                <p className="text-xs text-orange-500">KPI đạt được</p>
                <div className="mt-2 text-xs text-gray-600">
                  <span className="inline-flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Vượt mục tiêu {dashboardData?.forecasts?.performance ? Math.max(0, dashboardData.forecasts.performance - 85) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Trend Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Seasonal Trends */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#a10000]" />
                  Xu hướng theo mùa
                </h4>
                <div className="space-y-3">
                  {dashboardData?.trends?.seasonal?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item.status === 'peak' ? 'bg-red-500' :
                          item.status === 'high' ? 'bg-orange-500' :
                          item.status === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{item.season}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${
                          item.status === 'peak' ? 'text-red-600' :
                          item.status === 'high' ? 'text-orange-600' :
                          item.status === 'moderate' ? 'text-yellow-600' : 'text-green-600'
                        }`}>{item.trend}</p>
                        <p className="text-xs text-gray-500">Tăng trưởng</p>
                      </div>
                    </div>
                  )) || [
                    { season: 'Mùa xuân (Tết)', trend: '+45%', status: 'peak', description: 'Tăng mạnh do nhu cầu quà tặng' },
                    { season: 'Mùa hè', trend: '+12%', status: 'moderate', description: 'Tăng nhẹ do nhu cầu sức khỏe' },
                    { season: 'Mùa thu', trend: '+8%', status: 'stable', description: 'Tăng ổn định' },
                    { season: 'Mùa đông', trend: '+25%', status: 'high', description: 'Tăng do nhu cầu bồi bổ' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item.status === 'peak' ? 'bg-red-500' :
                          item.status === 'high' ? 'bg-orange-500' :
                          item.status === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{item.season}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${
                          item.status === 'peak' ? 'text-red-600' :
                          item.status === 'high' ? 'text-orange-600' :
                          item.status === 'moderate' ? 'text-yellow-600' : 'text-green-600'
                        }`}>{item.trend}</p>
                        <p className="text-xs text-gray-500">Tăng trưởng</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Performance Trends */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-[#a10000]" />
                  Xu hướng sản phẩm
                </h4>
                <div className="space-y-3">
                  {dashboardData?.trends?.products?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item.momentum === 'rising' ? 'bg-green-500' :
                          item.momentum === 'stable' ? 'bg-blue-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{item.product}</p>
                          <p className="text-xs text-gray-500">Độ tin cậy: {item.confidence === 'high' ? 'Cao' : 'Trung bình'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${
                          item.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>{item.trend}</p>
                        <p className="text-xs text-gray-500">Xu hướng</p>
                      </div>
                    </div>
                  )) || [
                    { product: 'Tổ yến tinh chế 100g', trend: '+23%', momentum: 'rising', confidence: 'high' },
                    { product: 'Combo quà tặng cao cấp', trend: '+18%', momentum: 'rising', confidence: 'medium' },
                    { product: 'Tổ yến thô 50g', trend: '+5%', momentum: 'stable', confidence: 'high' },
                    { product: 'Tổ yến lông 200g', trend: '-2%', momentum: 'declining', confidence: 'medium' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item.momentum === 'rising' ? 'bg-green-500' :
                          item.momentum === 'stable' ? 'bg-blue-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{item.product}</p>
                          <p className="text-xs text-gray-500">Độ tin cậy: {item.confidence === 'high' ? 'Cao' : 'Trung bình'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${
                          item.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>{item.trend}</p>
                        <p className="text-xs text-gray-500">Xu hướng</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Market Intelligence */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#a10000]" />
                  Thông tin thị trường
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Thị phần hiện tại</span>
                    <span className="font-medium text-sm">{dashboardData?.marketIntelligence?.currentMarketShare?.toFixed(1) || '12.5'}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mục tiêu thị phần</span>
                    <span className="font-medium text-sm">{dashboardData?.marketIntelligence?.targetMarketShare || '15'}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tốc độ tăng trưởng</span>
                    <span className="font-medium text-sm text-green-600">+{dashboardData?.marketIntelligence?.growthRate?.toFixed(1) || '2.3'}%/tháng</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Đối thủ cạnh tranh</span>
                    <span className="font-medium text-sm">{dashboardData?.marketIntelligence?.competitors || '8'} công ty</span>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#a10000]" />
                  Đánh giá rủi ro
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rủi ro tồn kho</span>
                    <span className={`font-medium text-sm ${
                      dashboardData?.riskAssessment?.inventoryRisk === 'high' ? 'text-red-600' :
                      dashboardData?.riskAssessment?.inventoryRisk === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {dashboardData?.riskAssessment?.inventoryRisk === 'high' ? 'Cao' :
                       dashboardData?.riskAssessment?.inventoryRisk === 'medium' ? 'Trung bình' : 'Thấp'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rủi ro cạnh tranh</span>
                    <span className={`font-medium text-sm ${
                      dashboardData?.riskAssessment?.competitionRisk === 'high' ? 'text-red-600' :
                      dashboardData?.riskAssessment?.competitionRisk === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {dashboardData?.riskAssessment?.competitionRisk === 'high' ? 'Cao' :
                       dashboardData?.riskAssessment?.competitionRisk === 'medium' ? 'Trung bình' : 'Thấp'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rủi ro thị trường</span>
                    <span className={`font-medium text-sm ${
                      dashboardData?.riskAssessment?.marketRisk === 'high' ? 'text-red-600' :
                      dashboardData?.riskAssessment?.marketRisk === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      {dashboardData?.riskAssessment?.marketRisk === 'high' ? 'Cao' :
                       dashboardData?.riskAssessment?.marketRisk === 'medium' ? 'Trung bình' : 'Thấp'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tổng điểm rủi ro</span>
                    <span className="font-medium text-sm text-green-600">{dashboardData?.riskAssessment?.totalRiskScore?.toFixed(1) || '2.1'}/10</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
