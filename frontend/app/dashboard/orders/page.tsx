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
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';

export default function OrdersPage() {
  const { user } = useRequireAuth('/login');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock orders data - replace with real API call
  const orders = [
    {
      id: '12345',
      date: '2024-01-15',
      status: 'completed',
      items: [
        { name: 'Yến sào tinh chế 100g', quantity: 2, price: 1500000 }
      ],
      total: 3000000
    },
    {
      id: '12344',
      date: '2024-01-10',
      status: 'processing',
      items: [
        { name: 'Yến sào rút lông 50g', quantity: 1, price: 800000 }
      ],
      total: 800000
    },
    {
      id: '12343',
      date: '2024-01-05',
      status: 'shipped',
      items: [
        { name: 'Yến sào thô 200g', quantity: 1, price: 1200000 }
      ],
      total: 1200000
    }
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', text: 'Hoàn thành' };
      case 'processing':
        return { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100', text: 'Đang xử lý' };
      case 'shipped':
        return { icon: Truck, color: 'text-orange-600', bgColor: 'bg-orange-100', text: 'Đang giao' };
      case 'cancelled':
        return { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', text: 'Đã hủy' };
      default:
        return { icon: Package, color: 'text-gray-600', bgColor: 'bg-gray-100', text: 'Không xác định' };
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
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
                className="bg-[#a10000] hover:bg-red-800"
              >
                Tất cả
              </Button>
              <Button
                variant={filterStatus === 'processing' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('processing')}
                className="bg-[#a10000] hover:bg-red-800"
              >
                Đang xử lý
              </Button>
              <Button
                variant={filterStatus === 'shipped' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('shipped')}
                className="bg-[#a10000] hover:bg-red-800"
              >
                Đang giao
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('completed')}
                className="bg-[#a10000] hover:bg-red-800"
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
            <Link
              href="/products"
              className="inline-block bg-glossy text-red-900 font-bold px-6 py-3 rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 hover:shadow-3xl animate-button-zoom button-glow text-sm"
              style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}
            >
              Mua sắm ngay
            </Link>
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
                          <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <Badge className={`${statusInfo.bgColor} ${statusInfo.color}`}>
                          {statusInfo.text}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
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
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="inline-block bg-glossy text-red-900 font-bold px-6 py-3 rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 hover:shadow-3xl animate-button-zoom button-glow text-sm"
                        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}
                      >
                        <Eye className="w-4 h-4 mr-2 inline" />
                        Xem chi tiết
                      </Link>
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
