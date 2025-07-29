'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Package, Calendar, User, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GuestOrder {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  shippingAddress: string;
  orderItems: Array<{
    quantity: number;
    price: number;
    product: {
      name: string;
      images: Array<{ url: string }>;
    };
  }>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'PAID':
      return 'bg-blue-100 text-blue-800';
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-800';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Chờ xử lý';
    case 'PAID':
      return 'Đã thanh toán';
    case 'SHIPPED':
      return 'Đã gửi hàng';
    case 'DELIVERED':
      return 'Đã giao hàng';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return status;
  }
};

export default function GuestOrdersPage() {
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState<GuestOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/orders/guest/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        throw new Error('Không thể tìm kiếm đơn hàng');
      }

      const data = await response.json();
      setOrders(data);
      setSearched(true);
    } catch (error) {
      console.error('Error searching orders:', error);
      alert('Có lỗi xảy ra khi tìm kiếm đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tra cứu đơn hàng
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nhập email hoặc số điện thoại để kiểm tra đơn hàng của bạn
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Tìm kiếm đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                type="text"
                placeholder="Nhập email hoặc số điện thoại..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
                minLength={3}
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang tìm...' : 'Tìm kiếm'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searched && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Kết quả tìm kiếm ({orders.length} đơn hàng)
            </h2>

            {orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Không tìm thấy đơn hàng nào với thông tin đã nhập.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Vui lòng kiểm tra lại email hoặc số điện thoại.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">
                              Đơn hàng #{order.id.slice(-8).toUpperCase()}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(order.createdAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {order.guestName}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                          <div className="text-lg font-bold text-green-600 mt-1">
                            {formatCurrency(order.total)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Thông tin liên hệ</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              {order.guestEmail}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              {order.guestPhone}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Địa chỉ giao hàng</h4>
                          <p className="text-sm text-gray-600">
                            {order.shippingAddress}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Sản phẩm đã đặt</h4>
                        <div className="space-y-2">
                          {order.orderItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                {item.product.images[0] && (
                                  <img
                                    src={item.product.images[0].url}
                                    alt={item.product.name}
                                    className="w-8 h-8 object-cover rounded"
                                  />
                                )}
                                <span>{item.product.name}</span>
                                <span className="text-gray-500">x{item.quantity}</span>
                              </div>
                              <span className="font-medium">
                                {formatCurrency(item.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 