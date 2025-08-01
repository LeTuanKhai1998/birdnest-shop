'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  Search, 
  Filter,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Loader2,
  FileText,
  User,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/api';
import { Order } from '@/lib/types';

export default function OrdersPage() {
  const { user, isLoading, isAuthenticated } = useRequireAuth('/login');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const ordersData = await apiService.getMyOrders();
        setOrders(ordersData || []);
        setError('');
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Không thể tải danh sách đơn hàng');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', text: 'Hoàn thành' };
      case 'PENDING':
        return { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100', text: 'Đang xử lý' };
      case 'SHIPPED':
        return { icon: Truck, color: 'text-orange-600', bgColor: 'bg-orange-100', text: 'Đang giao' };
      case 'CANCELLED':
        return { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', text: 'Đã hủy' };
      case 'PAID':
        return { icon: CheckCircle, color: 'text-purple-600', bgColor: 'bg-purple-100', text: 'Đã thanh toán' };
      default:
        return { icon: Package, color: 'text-gray-600', bgColor: 'bg-gray-100', text: 'Không xác định' };
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderItems.some(item => item.product?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white flex items-center justify-center">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isLoading ? 'Đang tải...' : 'Vui lòng đăng nhập'}
            </h3>
            <p className="text-gray-600">
              {isLoading ? 'Vui lòng đợi trong giây lát' : 'Bạn cần đăng nhập để xem đơn hàng'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white flex items-center justify-center">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang tải đơn hàng...</h3>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white flex items-center justify-center">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-[#a10000] hover:bg-red-800"
            >
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Filter */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pt-6">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-[#a10000]">
            <Search className="w-5 h-5" />
            Tìm Kiếm & Lọc
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm đơn hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className={filterStatus === 'all' 
                  ? "bg-[#a10000] hover:bg-red-800 text-white" 
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }
              >
                Tất cả
              </Button>
              <Button
                variant={filterStatus === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('PENDING')}
                className={filterStatus === 'PENDING' 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "border-blue-300 text-blue-700 hover:bg-blue-50"
                }
              >
                Đang xử lý
              </Button>
              <Button
                variant={filterStatus === 'SHIPPED' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('SHIPPED')}
                className={filterStatus === 'SHIPPED' 
                  ? "bg-orange-600 hover:bg-orange-700 text-white" 
                  : "border-orange-300 text-orange-700 hover:bg-orange-50"
                }
              >
                Đang giao
              </Button>
              <Button
                variant={filterStatus === 'DELIVERED' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('DELIVERED')}
                className={filterStatus === 'DELIVERED' 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "border-green-300 text-green-700 hover:bg-green-50"
                }
              >
                Hoàn thành
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!'
              }
            </p>
            <Button asChild className="bg-[#a10000] hover:bg-red-800 h-11">
              <Link href="/products">
                Mua sắm ngay
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <Card key={order.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardHeader className="pt-6">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-[#a10000]">
                    <FileText className="w-5 h-5" />
                    Đơn Hàng #{order.id}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pb-6">
                  {/* Order Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        {order.user?.name || order.guestName || 'Khách'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
                      <Badge className={`${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.text}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
                        <div className="w-16 h-16 flex-shrink-0">
                          <div className="relative w-full h-full rounded-lg bg-gray-50 border overflow-hidden">
                            <Package className="w-8 h-8 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm line-clamp-2">
                            {item.product?.name || 'Sản phẩm không xác định'}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">x{item.quantity}</span>
                          </div>
                        </div>
                        <div className="font-semibold text-[#a10000] text-sm">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(item.price) * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total and Actions */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Tổng cộng</p>
                      <p className="text-xl font-bold text-[#a10000]">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(order.total))}
                      </p>
                    </div>
                    <Button asChild className="bg-[#a10000] hover:bg-red-800 h-11">
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Link>
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
