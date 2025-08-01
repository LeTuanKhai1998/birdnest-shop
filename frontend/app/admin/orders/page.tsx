'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  RefreshCw, 
  CheckCircle2,
  Package,
  Eye,
  Calendar,
  User,
  DollarSign,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  TrendingUp,
  TrendingDown,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useSWR from 'swr';
import { apiService } from '@/lib/api';
import { Order } from '@/lib/types';

const STATUS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_CONFIG = {
  PENDING: { 
    label: 'Chờ xử lý', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    icon: Clock,
    description: 'Đang chờ xử lý'
  },
  PROCESSING: { 
    label: 'Đang xử lý', 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: CheckCircle,
    description: 'Đang chuẩn bị'
  },
  SHIPPED: { 
    label: 'Đã gửi', 
    color: 'bg-purple-100 text-purple-800 border-purple-200', 
    icon: Truck,
    description: 'Đang vận chuyển'
  },
  DELIVERED: { 
    label: 'Đã giao', 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: CheckCircle2,
    description: 'Đã giao thành công'
  },
  CANCELLED: { 
    label: 'Đã hủy', 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: XCircle,
    description: 'Đơn hàng đã hủy'
  }
};

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const { data: orders, isLoading, mutate } = useSWR('admin-orders', () => apiService.getOrders());
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewId, setViewId] = useState<string | null>(null);
  const [statusUpdateId, setStatusUpdateId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      window.location.href = '/login?callbackUrl=/admin';
      return;
    }

    const userData = JSON.parse(user);
    if (!userData.isAdmin) {
      window.location.href = '/login?callbackUrl=/admin';
      return;
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue]);

  // Filter orders in-memory
  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    
    return orders.filter((o: Order) => {
      if (!o) return false;
      
      const matchesSearch =
        !debouncedSearch ||
        (o.id && o.id.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (o.user?.name && o.user.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
      const matchesStatus = !statusFilter || statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, debouncedSearch, statusFilter]);

  // Calculate metrics with trends
  const metrics = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return null;
    
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentOrders = orders.filter((o: Order) => o && o.createdAt && new Date(o.createdAt) >= lastWeek);
    const lastMonthOrders = orders.filter((o: Order) => o && o.createdAt && new Date(o.createdAt) >= lastMonth);
    
    const totalRevenue = orders.reduce((sum: number, o: Order) => {
      if (!o || !o.total) return sum;
      return sum + parseFloat(o.total);
    }, 0);
    const recentRevenue = recentOrders.reduce((sum: number, o: Order) => {
      if (!o || !o.total) return sum;
      return sum + parseFloat(o.total);
    }, 0);
    const lastMonthRevenue = lastMonthOrders.reduce((sum: number, o: Order) => {
      if (!o || !o.total) return sum;
      return sum + parseFloat(o.total);
    }, 0);
    
    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter((o: Order) => o && o.status === 'PENDING').length,
      completedOrders: orders.filter((o: Order) => o && o.status === 'DELIVERED').length,
      totalRevenue,
      recentRevenue,
      revenueTrend: lastMonthRevenue > 0 ? ((recentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0,
      orderTrend: lastMonthOrders.length > 0 ? ((recentOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100 : 0,
    };
  }, [orders]);

  // Status change handler
  const onStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      await mutate();
      setStatusUpdateId(null);
      setNewStatus('');
      toast({
        title: "Status updated successfully",
        description: `Order status changed to ${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG]?.label}`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await mutate();
      toast({
        title: "Data refreshed",
        description: "Order list has been updated successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    toast({
      title: "Export feature",
      description: "Export functionality will be implemented soon",
      variant: "default",
    });
  };

  function formatFullDate(date: string) {
    const d = new Date(date);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }

  function formatRelativeDate(date: string) {
    const d = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return d.toLocaleDateString('vi-VN');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
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
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
                  <p className="text-gray-600 mt-1">
                    Quản lý đơn hàng khách hàng, theo dõi vận chuyển và xử lý thanh toán
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white rounded-lg border p-1">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    Bảng
                  </Button>
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                  >
                    Thẻ
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Xuất
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.totalOrders}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {metrics.orderTrend > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm ${metrics.orderTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(metrics.orderTrend).toFixed(1)}%
                        </span>
                        <span className="text-sm text-gray-500">vs last month</span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.pendingOrders}</p>
                      <p className="text-sm text-gray-500 mt-2">Requires attention</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.completedOrders}</p>
                      <p className="text-sm text-gray-500 mt-2">Successfully delivered</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(metrics.totalRevenue)}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        {metrics.revenueTrend > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm ${metrics.revenueTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(metrics.revenueTrend).toFixed(1)}%
                        </span>
                        <span className="text-sm text-gray-500">vs last month</span>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6 border-l-4 border-l-gray-500">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label className="block text-xs font-medium mb-1 text-gray-700">
                    Search Orders
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by order ID or customer name..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="min-w-[150px]">
                  <Label className="block text-xs font-medium mb-1 text-gray-700">
                    Status Filter
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {STATUS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    {filteredOrders?.length || 0} orders
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Display */}
          {viewMode === 'table' ? (
            <Card>
              <CardHeader>
                <CardTitle>Order List</CardTitle>
                <CardDescription>
                  View and manage customer orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!filteredOrders || filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchValue || statusFilter 
                        ? 'Try adjusting your search or filter criteria'
                        : 'No orders have been placed yet'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium text-gray-700">Order</th>
                          <th className="text-left p-4 font-medium text-gray-700">Customer</th>
                          <th className="text-left p-4 font-medium text-gray-700">Total</th>
                          <th className="text-left p-4 font-medium text-gray-700">Status</th>
                          <th className="text-left p-4 font-medium text-gray-700">Date</th>
                          <th className="text-right p-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order: Order) => {
                          const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
                          const StatusIcon = statusConfig?.icon || Clock;
                          
                          return (
                            <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{order.id}</p>
                                    <p className="text-xs text-gray-500">
                                      {(order.orderItems?.length || 0)} items
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm">{order.user?.name || 'Unknown'}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <p className="font-medium text-sm">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(order.total))}
                                </p>
                              </td>
                              <td className="p-4">
                                <Badge className={`${statusConfig?.color} flex items-center gap-1 border`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {statusConfig?.label}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <div>
                                    <span className="text-sm">{formatFullDate(order.createdAt)}</span>
                                    <p className="text-xs text-gray-500">{formatRelativeDate(order.createdAt)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setViewId(order.id)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {filteredOrders?.map((order: Order) => {
                const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
                const StatusIcon = statusConfig?.icon || Clock;
                
                return (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-sm">{order.id}</span>
                        </div>
                        <Badge className={`${statusConfig?.color} text-xs border`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig?.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{order.user?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(order.total))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatRelativeDate(order.createdAt)}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {(order.orderItems?.length || 0)} items
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewId(order.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Dialog */}
      {viewId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Order Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setViewId(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <p className="text-sm text-gray-600">Order details would be displayed here...</p>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setViewId(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Dialog */}
      {statusUpdateId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Update Order Status</h2>
              <Button variant="ghost" size="sm" onClick={() => {
                setStatusUpdateId(null);
                setNewStatus('');
              }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Change the status of this order
            </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS.map((status) => (
                                         <SelectItem key={status} value={status}>
                       <div className="flex items-center gap-2">
                         {(() => {
                           const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
                           const Icon = config?.icon;
                           return Icon ? <Icon className="w-4 h-4" /> : null;
                         })()}
                         {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label}
                       </div>
                     </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setStatusUpdateId(null);
                  setNewStatus('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => statusUpdateId && newStatus && onStatusChange(statusUpdateId, newStatus)}
                disabled={!newStatus}
              >
                Update Status
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
