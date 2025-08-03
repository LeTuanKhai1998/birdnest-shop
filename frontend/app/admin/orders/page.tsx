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
  X,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  CreditCard,
  Truck as TruckIcon,
  FileText,
  ArrowLeft,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/ui/avatar';
import useSWR from 'swr';
import { apiService } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatReadableId, getEntityTypeColor, getEntityTypeLabel } from '@/lib/id-utils';
import { OrderId } from '@/components/ui/ReadableId';


const STATUS = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_CONFIG = {
  PENDING: { 
    label: 'Chờ xử lý', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    icon: Clock,
    description: 'Đang chờ xử lý'
  },
  PAID: { 
    label: 'Đã thanh toán', 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: CheckCircle,
    description: 'Đã thanh toán và đang chuẩn bị'
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
  const { data: orderStats, isLoading: statsLoading } = useSWR('admin-order-stats', () => apiService.getOrderStats());
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewId, setViewId] = useState<string | null>(null);
  const [statusUpdateId, setStatusUpdateId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [detailedOrder, setDetailedOrder] = useState<Order | null>(null);
  const [loadingDetailedOrder, setLoadingDetailedOrder] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Sorting state
  const [sortField, setSortField] = useState<'createdAt' | 'total'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');



  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue]);

  // Fetch detailed order when viewId changes
  useEffect(() => {
    if (viewId) {
      fetchDetailedOrder(viewId);
    } else {
      setDetailedOrder(null);
    }
  }, [viewId]);

  // Handle sorting
  const handleSort = (field: 'createdAt' | 'total') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Filter and sort orders in-memory
  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    
    let filtered = orders.filter((o: Order) => {
      if (!o) return false;
      
      const matchesSearch =
        !debouncedSearch ||
        (o.id && o.id.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (o.user?.name && o.user.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
      const matchesStatus = !statusFilter || statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    
    // Sort orders
    filtered.sort((a: Order, b: Order) => {
      let aValue: any, bValue: any;
      
      if (sortField === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else if (sortField === 'total') {
        aValue = parseFloat(a.total);
        bValue = parseFloat(b.total);
      } else {
        return 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
    
    return filtered;
  }, [orders, debouncedSearch, statusFilter, sortField, sortDirection]);

  // Pagination logic
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const totalItems = filteredOrders.length;
  


  // Calculate metrics with real data from backend
  const metrics = useMemo(() => {
    if (!orderStats || !orders || !Array.isArray(orders)) return null;
    
    // Get counts by status from backend stats
    const statusCounts = orderStats.ordersByStatus || [];
    const pendingOrders = statusCounts.find((s: any) => s.status === 'PENDING')?._count?.status || 0;
    const completedOrders = statusCounts.find((s: any) => s.status === 'DELIVERED')?._count?.status || 0;
    
    // Calculate trends (simplified - can be enhanced later)
    const orderTrend = 0.0; // Placeholder for now
    const revenueTrend = 0.0; // Placeholder for now
    
    return {
      totalOrders: orderStats.totalOrders || 0,
      totalRevenue: orderStats.totalRevenue || 0,
      pendingOrders,
      completedOrders,
      orderTrend,
      revenueTrend
    };
  }, [orderStats, orders]);

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

  const fetchDetailedOrder = async (orderId: string) => {
    setLoadingDetailedOrder(true);
    try {
      const detailedOrderData = await apiService.getOrder(orderId);
      setDetailedOrder(detailedOrderData);
    } catch (error) {
      toast({
        title: "Failed to load order details",
        description: "Could not fetch detailed order information. Please try again.",
        variant: "destructive",
      });
      setDetailedOrder(null);
    } finally {
      setLoadingDetailedOrder(false);
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

  if (isLoading || statsLoading) {
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
    <div>
      {/* View Mode Toggle and Actions */}
      <div className="flex items-center justify-end gap-3 mb-6">
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

          {/* Metrics Cards */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
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
                        <span className="text-sm text-gray-500">so với tháng trước</span>
                      </div>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-4.8 h-4.8 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Đơn hàng chờ xử lý</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.pendingOrders}</p>
                      <p className="text-sm text-gray-500 mt-2">Cần chú ý</p>
                    </div>
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="w-4.8 h-4.8 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Đơn hàng hoàn thành</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.completedOrders}</p>
                      <p className="text-sm text-gray-500 mt-2">Đã giao thành công</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle2 className="w-4.8 h-4.8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
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
                        <span className="text-sm text-gray-500">so với tháng trước</span>
                      </div>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <DollarSign className="w-4.8 h-4.8 text-purple-600" />
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
                    Tìm kiếm đơn hàng
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm theo ID đơn hàng hoặc tên khách hàng..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="min-w-[150px]">
                  <Label className="block text-xs font-medium mb-1 text-gray-700">
                    Lọc theo trạng thái
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
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
                    {filteredOrders?.length || 0} đơn hàng
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Display */}
          {viewMode === 'table' ? (
            <Card>
              <CardHeader className="pt-6">
                <CardTitle>Danh sách đơn hàng</CardTitle>
                <CardDescription>
                  Xem và quản lý đơn hàng của khách hàng
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                {!paginatedOrders || paginatedOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
                    <p className="text-gray-600 mb-4">
                      {searchValue || statusFilter 
                        ? 'Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc'
                        : 'Chưa có đơn hàng nào được đặt'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium text-gray-700">Đơn hàng</th>
                          <th className="text-left p-4 font-medium text-gray-700">Khách hàng</th>
                          <th className="text-left p-4 font-medium text-gray-700">
                            <button
                              onClick={() => handleSort('total')}
                              className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                            >
                              Tổng tiền
                              {sortField === 'total' ? (
                                sortDirection === 'asc' ? (
                                  <ArrowUp className="w-4 h-4" />
                                ) : (
                                  <ArrowDown className="w-4 h-4" />
                                )
                              ) : (
                                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </th>
                          <th className="text-left p-4 font-medium text-gray-700">Trạng thái</th>
                          <th className="text-left p-4 font-medium text-gray-700">
                            <button
                              onClick={() => handleSort('createdAt')}
                              className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                            >
                              Ngày
                              {sortField === 'createdAt' ? (
                                sortDirection === 'asc' ? (
                                  <ArrowUp className="w-4 h-4" />
                                ) : (
                                  <ArrowDown className="w-4 h-4" />
                                )
                              ) : (
                                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </th>
                          <th className="text-right p-4 font-medium text-gray-700 whitespace-nowrap">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOrders.map((order: Order) => {
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
                                    <OrderId readableId={order.readableId} fallbackId={order.id} size="sm" />
                                    <p className="text-xs text-gray-500">
                                      {(order.orderItems?.length || 0)} sản phẩm
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm">{order.user?.name || 'Không xác định'}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <p className="font-medium text-sm">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(order.total))}
                                </p>
                              </td>
                              <td className="p-4">
                                <Badge className={`${statusConfig?.color} inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border-0 whitespace-nowrap`}>
                                  <StatusIcon className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{statusConfig?.label}</span>
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
              
              {/* Enhanced Pagination Controls */}
              {totalItems > 0 && (
                <div className="mt-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Page Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        Hiển thị <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> - <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> trong tổng số <span className="font-medium">{totalItems}</span> đơn hàng
                      </span>
                      
                      {/* Page Size Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Hiển thị:</span>
                        <Select value={pageSize.toString()} onValueChange={(value: string) => {
                          setPageSize(parseInt(value));
                          setCurrentPage(1);
                        }}>
                          <SelectTrigger className="w-16 h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Enhanced Pagination Navigation */}
                    <div className="flex items-center gap-1">
                      {/* First Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                        title="Trang đầu"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </Button>
                      
                      {/* Previous Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                        title="Trang trước"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      {/* Page Numbers with Ellipsis */}
                      <div className="flex items-center gap-1">
                        {(() => {
                          const pages = [];
                          const maxVisible = 5;
                          
                          if (totalPages <= maxVisible) {
                            // Show all pages if total is small
                            for (let i = 1; i <= totalPages; i++) {
                              pages.push(
                                <Button
                                  key={i}
                                  variant={currentPage === i ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(i)}
                                  className="h-8 w-8 p-0 text-sm font-medium"
                                >
                                  {i}
                                </Button>
                              );
                            }
                          } else {
                            // Show smart pagination with ellipsis
                            if (currentPage <= 3) {
                              // Near start
                              for (let i = 1; i <= 4; i++) {
                                pages.push(
                                  <Button
                                    key={i}
                                    variant={currentPage === i ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(i)}
                                    className="h-8 w-8 p-0 text-sm font-medium"
                                  >
                                    {i}
                                  </Button>
                                );
                              }
                              pages.push(
                                <span key="ellipsis1" className="px-2 text-gray-400">...</span>
                              );
                              pages.push(
                                <Button
                                  key={totalPages}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentPage(totalPages)}
                                  className="h-8 w-8 p-0 text-sm font-medium"
                                >
                                  {totalPages}
                                </Button>
                              );
                            } else if (currentPage >= totalPages - 2) {
                              // Near end
                              pages.push(
                                <Button
                                  key={1}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentPage(1)}
                                  className="h-8 w-8 p-0 text-sm font-medium"
                                >
                                  1
                                </Button>
                              );
                              pages.push(
                                <span key="ellipsis2" className="px-2 text-gray-400">...</span>
                              );
                              for (let i = totalPages - 3; i <= totalPages; i++) {
                                pages.push(
                                  <Button
                                    key={i}
                                    variant={currentPage === i ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(i)}
                                    className="h-8 w-8 p-0 text-sm font-medium"
                                  >
                                    {i}
                                  </Button>
                                );
                              }
                            } else {
                              // Middle
                              pages.push(
                                <Button
                                  key={1}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentPage(1)}
                                  className="h-8 w-8 p-0 text-sm font-medium"
                                >
                                  1
                                </Button>
                              );
                              pages.push(
                                <span key="ellipsis3" className="px-2 text-gray-400">...</span>
                              );
                              for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                                pages.push(
                                  <Button
                                    key={i}
                                    variant={currentPage === i ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(i)}
                                    className="h-8 w-8 p-0 text-sm font-medium"
                                  >
                                    {i}
                                  </Button>
                                );
                              }
                              pages.push(
                                <span key="ellipsis4" className="px-2 text-gray-400">...</span>
                              );
                              pages.push(
                                <Button
                                  key={totalPages}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentPage(totalPages)}
                                  className="h-8 w-8 p-0 text-sm font-medium"
                                >
                                  {totalPages}
                                </Button>
                              );
                            }
                          }
                          
                          return pages;
                        })()}
                      </div>
                      
                      {/* Next Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                        title="Trang tiếp"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      
                      {/* Last Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                        title="Trang cuối"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {!paginatedOrders || paginatedOrders.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
                  <p className="text-gray-600 mb-4">
                    {searchValue || statusFilter 
                      ? 'Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc'
                      : 'Chưa có đơn hàng nào được đặt'
                    }
                  </p>
                </div>
              ) : (
                paginatedOrders.map((order: Order) => {
                const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
                const StatusIcon = statusConfig?.icon || Clock;
                
                return (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-blue-600" />
                                                      <OrderId readableId={order.readableId} fallbackId={order.id} size="sm" />
                        </div>
                        <Badge className={`${statusConfig?.color} inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium border-0 whitespace-nowrap`}>
                          <StatusIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{statusConfig?.label}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{order.user?.name || 'Không xác định'}</span>
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
                            {(order.orderItems?.length || 0)} sản phẩm
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewId(order.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Xem
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
            </div>
          )}

      {/* Order Details Dialog */}
      <Dialog open={!!viewId} onOpenChange={(open) => !open && setViewId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 [&>button]:text-white [&>button]:hover:text-white [&>button]:hover:bg-white/20 [&>button]:opacity-100 [&>button]:text-lg [&>button]:font-bold">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Package className="w-5 h-5" />
            </div>
              <div>
                <DialogTitle className="text-xl font-black text-white !text-white">
                  Chi tiết đơn hàng
                </DialogTitle>
                <DialogDescription className="text-white !text-white font-medium">
                  Thông tin chi tiết và trạng thái đơn hàng
                </DialogDescription>
                </div>
                </div>
          </DialogHeader>
          
          <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
            {loadingDetailedOrder ? (
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-6 w-16" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                    <Card>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-32 mb-4" />
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-3 w-2/3" />
                        </div>
                            <Skeleton className="h-4 w-16" />
                        </div>
                        ))}
                        </div>
                      </CardContent>
                    </Card>
                </div>
              </div>
            ) : !detailedOrder ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
                <p className="text-gray-600">Đơn hàng có thể đã bị xóa hoặc không tồn tại.</p>
              </div>
            ) : (
                             <div className="p-6 space-y-6">
                {/* Order Header with Status */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#a10000] rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                                              <h3 className="font-bold text-lg text-gray-900">
                          <OrderId readableId={detailedOrder.readableId} fallbackId={detailedOrder.id} size="lg" />
                        </h3>
                      <p className="text-sm text-gray-600">
                        Đặt hàng lúc {formatFullDate(detailedOrder.createdAt)}
                      </p>
                    </div>
                  </div>
                                    <div className="text-right">
                    {(() => {
                      const statusConfig = STATUS_CONFIG[detailedOrder.status as keyof typeof STATUS_CONFIG];
                      const StatusIcon = statusConfig?.icon || Clock;
                      const isRestricted = detailedOrder.status === 'CANCELLED' || detailedOrder.status === 'DELIVERED';
                      
                      return (
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={`${statusConfig?.color} inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border-0`}>
                            <StatusIcon className="w-4 h-4 flex-shrink-0" />
                            <span>{statusConfig?.label}</span>
                          </Badge>
                          {isRestricted && (
                            <p className="text-xs text-gray-500 italic">
                              Không thể thay đổi trạng thái
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Customer and Order Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                  {/* Customer Information */}
                  <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                    <CardHeader className="pt-4">
                      <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                          Thông tin khách hàng
                        </CardTitle>
                      </CardHeader>
                                         <CardContent className="space-y-3">
                       <div className="flex items-center gap-3">
                         <Avatar 
                           src="" 
                           name={detailedOrder.user?.name || 'User'}
                           size={40}
                           className="bg-blue-100"
                         />
                         <div>
                           <p className="font-medium text-sm">{detailedOrder.user?.name || 'Khách hàng'}</p>
                           <p className="text-xs text-gray-500">ID: <UserId readableId={detailedOrder.user?.readableId} fallbackId={detailedOrder.user?.id} variant="text" size="sm" /></p>
                        </div>
                       </div>
                       <Separator />
                       <div className="space-y-2">
                         <div className="flex items-center gap-2 text-sm">
                           <Mail className="w-4 h-4 text-gray-400" />
                           <span className="text-gray-600">{detailedOrder.user?.email || 'Không có email'}</span>
                         </div>
                         <div className="flex items-center gap-2 text-sm">
                           <Phone className="w-4 h-4 text-gray-400" />
                           <span className="text-gray-600">Không có số điện thoại</span>
                         </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                  {/* Order Summary */}
                  <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                    <CardHeader className="pt-4">
                      <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-green-600" />
                        Tóm tắt đơn hàng
                        </CardTitle>
                      </CardHeader>
                    <CardContent className="space-y-3 pb-4">
                      <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Số sản phẩm:</span>
                        <span className="font-medium text-sm">{(detailedOrder.orderItems?.length || 0)} sản phẩm</span>
                        </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Phương thức thanh toán:</span>
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">Thanh toán trực tuyến</span>
                  </div>
                              </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tổng thanh toán:</span>
                        <span className="text-lg font-bold text-[#a10000]">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(detailedOrder.total))}
                        </span>
                              </div>
                    </CardContent>
                  </Card>
                  
                  {/* Shipping Information */}
                  <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                    <CardHeader className="pt-4">
                      <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <TruckIcon className="w-4 h-4 text-purple-600" />
                        Thông tin giao hàng
                      </CardTitle>
                      </CardHeader>
                    <CardContent className="space-y-3">
                      {detailedOrder.shippingAddress ? (
                        <div className="space-y-2">
                          {(() => {
                            try {
                              const address = typeof detailedOrder.shippingAddress === 'string' 
                                ? JSON.parse(detailedOrder.shippingAddress) 
                                : detailedOrder.shippingAddress;
                              
                              return (
                                <>
                                  <div className="flex items-start gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                      <p className="font-medium">{address.fullName || 'Không có tên'}</p>
                                      <p className="text-gray-600">{address.address || 'Không có địa chỉ'}</p>
                                      {address.city && address.province && (
                                        <p className="text-gray-600">{address.city}, {address.province}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{address.phone || 'Không có số điện thoại'}</span>
                                  </div>
                                </>
                              );
                            } catch (error) {
                              return (
                                <div className="flex items-start gap-2 text-sm">
                                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                  <span className="text-gray-600">{detailedOrder.shippingAddress}</span>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Không có thông tin địa chỉ</p>
                        </div>
                      )}
                      </CardContent>
                    </Card>
                </div>

                {/* Order Items */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pt-6">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#a10000]" />
                      Sản phẩm đã đặt
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6">
                    {(() => {
                      const orderItems = detailedOrder.orderItems || [];
                      const hasItems = Array.isArray(orderItems) && orderItems.length > 0;
                      
                      return hasItems ? (
                        <div className="space-y-4">
                          {orderItems.map((item: any, index: number) => (
                                                     <div
                             key={index}
                             className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border hover:bg-gray-100 transition-colors"
                           >
                            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border shadow-sm">
                              {item.product?.image ? (
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <Package className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {item.product?.name || 'Sản phẩm không xác định'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Số lượng: {item.quantity} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(item.price))}
                              </p>
                              {item.product?.weight && (
                                <p className="text-xs text-gray-500">
                                  Trọng lượng: {item.product.weight}g
                                </p>
              )}
            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#a10000]">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(item.price) * item.quantity)}
                              </p>
          </div>
        </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">Không có sản phẩm nào trong đơn hàng</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Đơn hàng này có thể đã được tạo mà không có sản phẩm hoặc có lỗi trong quá trình tạo.
                        </p>
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-700">
                            <strong>Thông tin đơn hàng:</strong><br/>
                            ID: <OrderId readableId={detailedOrder.readableId} fallbackId={detailedOrder.id} variant="text" size="sm" /><br/>
                            Tổng tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(detailedOrder.total))}<br/>
                            Trạng thái: {STATUS_CONFIG[detailedOrder.status as keyof typeof STATUS_CONFIG]?.label}
                          </p>
                        </div>
                      </div>
                    );
                    })()}
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setViewId(null)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                  </Button>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => {
                        // Handle print/invoice
                        toast({
                          title: "Tính năng in hóa đơn",
                          description: "Tính năng này sẽ được phát triển sớm",
                          variant: "default",
                        });
                      }}
                    >
                      <FileText className="w-4 h-4" />
                      In hóa đơn
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      disabled={detailedOrder.status === 'CANCELLED' || detailedOrder.status === 'DELIVERED'}
                      onClick={() => {
                        // Handle status update
                        setStatusUpdateId(detailedOrder.id);
                        setViewId(null);
                      }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {detailedOrder.status === 'CANCELLED' || detailedOrder.status === 'DELIVERED' 
                        ? 'Không thể cập nhật' 
                        : 'Cập nhật trạng thái'
                      }
              </Button>
            </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={!!statusUpdateId} onOpenChange={(open) => !open && setStatusUpdateId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#a10000]" />
              Cập nhật trạng thái đơn hàng
            </DialogTitle>
            <DialogDescription>
              Thay đổi trạng thái của đơn hàng này để cập nhật tiến trình xử lý
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="status" className="text-sm font-medium">Trạng thái mới</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS.map((status) => {
                    // Don't allow changing status if order is already cancelled or delivered
                    const isRestricted = detailedOrder?.status === 'CANCELLED' || detailedOrder?.status === 'DELIVERED';
                    const isCurrentStatus = status === detailedOrder?.status;
                    
                    return (
                      <SelectItem 
                        key={status} 
                        value={status}
                        disabled={isRestricted && !isCurrentStatus}
                      >
                       <div className="flex items-center gap-2">
                         {(() => {
                           const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
                           const Icon = config?.icon;
                           return Icon ? <Icon className="w-4 h-4" /> : null;
                         })()}
                         {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label}
                          {isCurrentStatus && <span className="text-xs text-gray-500">(Hiện tại)</span>}
                       </div>
                     </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStatusUpdateId(null);
                  setNewStatus('');
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={() => statusUpdateId && newStatus && onStatusChange(statusUpdateId, newStatus)}
                disabled={!newStatus}
              className="bg-[#a10000] hover:bg-[#8a0000]"
              >
                Cập nhật
              </Button>
            </div>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}
