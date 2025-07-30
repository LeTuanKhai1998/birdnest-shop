'use client';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, Truck, XCircle, Eye, Search, Filter, Package, Calendar, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockOrders, Order } from '@/lib/mock-orders';
import { formatVND, formatDate, statusColor } from '@/lib/order-utils';
import Image from 'next/image';
import { useRequireAuth } from '@/hooks/useAuth';

// API response type
interface OrdersApiResponse {
  orders?: Order[];
  error?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const router = useRouter();
  const { user } = useRequireAuth('/login');
  
  // Check for localStorage authentication (admin users)
  const [localUser, setLocalUser] = useState<{ id: string; email: string; name: string; isAdmin: boolean } | null>(null);
  
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setLocalUser(user);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
  }, []);

  // Fetch orders from API
  useEffect(() => {
    setLoading(true);
    
    const fetchOrders = async () => {
      try {
        const isAdminUser = !!localUser;
        const endpoint = isAdminUser ? 'http://localhost:8080/api/orders' : '/api/orders';
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        
        if (isAdminUser) {
          const token = localStorage.getItem('auth-token');
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(endpoint, { headers });
        const data = await response.json();
        
        // Handle different response formats
        // Frontend API returns { orders: [...] }
        // Backend API returns [...] directly
        if (data.orders) {
          setOrders(data.orders);
        } else if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setError(data.error || 'Failed to load orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [localUser]);

  // Navigation handler
  const handleViewOrder = useCallback(
    (orderId: string) => {
      router.push(`/dashboard/orders/${orderId}`);
    },
    [router],
  );

  // Filter and search orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderItems.some(item => item.product.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Đã giao' };
      case 'SHIPPED':
        return { icon: Truck, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Đang giao' };
      case 'CANCELLED':
        return { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Đã hủy' };
      default:
        return { icon: Package, color: 'text-gray-600', bgColor: 'bg-gray-100', label: status };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a10000] mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang tải đơn hàng...</h3>
          <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Không thể tải đơn hàng</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-sm text-red-500">
              Để xem đơn hàng thực, vui lòng đăng nhập với tài khoản có đơn hàng.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No orders, show mock data
  const displayOrders = orders.length ? filteredOrders : mockOrders;
  const isMock = !orders.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Đơn hàng của bạn
        </h1>
        <p className="text-lg text-gray-600">
          {isMock ? 'Dữ liệu mẫu - Đăng nhập để xem đơn hàng thực' : `Bạn có ${orders.length} đơn hàng`}
        </p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm đơn hàng hoặc sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Tất cả
              </Button>
              <Button
                variant={filterStatus === 'DELIVERED' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('DELIVERED')}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Đã giao
              </Button>
              <Button
                variant={filterStatus === 'SHIPPED' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('SHIPPED')}
                className="flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                Đang giao
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid */}
      {displayOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!'
              }
            </p>
            <Button asChild>
              <a href="/products">Xem sản phẩm</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {displayOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card key={order.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="font-mono text-sm text-gray-500">
                        #{order.id.slice(0, 8)}
                      </span>
                    </div>
                    <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {formatDate(order.createdAt)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Product Info */}
                  <div className="flex items-center gap-4">
                    {order.orderItems[0]?.product?.images?.[0] && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={order.orderItems[0].product.images[0]}
                          alt={order.orderItems[0].product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {order.orderItems[0]?.product?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Số lượng: {order.orderItems[0]?.quantity}
                      </p>
                      {order.orderItems.length > 1 && (
                        <p className="text-xs text-gray-400">
                          +{order.orderItems.length - 1} sản phẩm khác
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="font-bold text-lg text-[#a10000]">
                        {formatVND(Number(order.total))}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order.id)}
                      className="group-hover:border-[#a10000] group-hover:text-[#a10000] transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
