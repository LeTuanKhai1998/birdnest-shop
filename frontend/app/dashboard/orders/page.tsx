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
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/api';
import { Order } from '@/lib/types';

export default function OrdersPage() {
  const { user } = useRequireAuth('/login');
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
    const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (!user) {
    return (
      <Card className="p-8">
        <CardContent className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang tải...</h3>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-8">
        <CardContent className="text-center">
          <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang tải đơn hàng...</h3>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <CardContent className="text-center">
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
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 
          className="text-glossy text-3xl md:text-5xl font-black italic"
          style={{
            fontWeight: 900,
            fontStyle: 'italic',
            fontFamily: 'Inter, sans-serif',
            fontSize: '3.3rem',
            padding: '20px',
            color: '#a10000'
          }}
        >
          Đơn hàng của tôi
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Theo dõi trạng thái và lịch sử đơn hàng của bạn
        </p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
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
                  ? "bg-gray-600 hover:bg-gray-700 text-white" 
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
        <Card>
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
              <Card key={order.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-2 rounded-full ${statusInfo.bgColor}`}>
                          <statusInfo.icon className={`w-5 h-5 ${statusInfo.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Đơn hàng #{order.id}</h3>
                          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <Badge className={`${statusInfo.bgColor} ${statusInfo.color}`}>
                          {statusInfo.text}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {order.orderItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.product?.name || 'Sản phẩm không xác định'}</p>
                              <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(item.price))}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="lg:text-right">
                      <div className="mb-4">
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
