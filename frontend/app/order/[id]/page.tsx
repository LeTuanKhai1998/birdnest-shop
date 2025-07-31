'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Truck, Clock, MapPin, User, FileText } from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    name: string;
    price: string;
    images?: string[];
    image?: string;
  };
}

interface Order {
  id: string;
  userId: string | null;
  total: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: 'COD' | 'BANK_TRANSFER' | 'STRIPE' | 'MOMO' | 'VNPAY';
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  guestEmail: string | null;
  guestName: string | null;
  guestPhone: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  orderItems: OrderItem[];
}

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        
        // Prepare headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        // Add authentication header if user is authenticated
        if (isAuthenticated) {
          const token = localStorage.getItem('auth-token');
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }
        
        // Use frontend API route for authenticated users, backend directly for guest orders
        const endpoint = isAuthenticated ? `/api/orders/${id}` : `http://localhost:8080/api/orders/${id}`;
        const response = await fetch(endpoint, {
          headers,
        });
        
        if (!response.ok) {
          throw new Error('Order not found');
        }
        
        const orderData = await response.json();
        setOrder(orderData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a10000] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-600 mb-4">{error || 'Đơn hàng không tồn tại hoặc bạn không có quyền truy cập'}</p>
          <Button asChild>
            <Link href="/products">Tiếp tục mua sắm</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ xử lý';
      case 'PAID': return 'Đã thanh toán';
      case 'SHIPPED': return 'Đang giao hàng';
      case 'DELIVERED': return 'Đã giao hàng';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'COD': return 'Thanh toán khi nhận hàng';
      case 'BANK_TRANSFER': return 'Chuyển khoản ngân hàng';
      case 'STRIPE': return 'Thẻ tín dụng/Ghi nợ';
      case 'MOMO': return 'Ví điện tử Momo';
      case 'VNPAY': return 'VNPAY';
      default: return method;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 mx-auto animate-bounce-in" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Đặt Hàng Thành Công!
          </h1>
          <p className="text-lg text-red-100">
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất có thể.
          </p>
        </div>
      </div>

      {/* Order Details */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-[#a10000]">
                  <FileText className="w-5 h-5" />
                  Thông Tin Đơn Hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-mono font-semibold">{order.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Phương thức thanh toán:</span>
                  <span className="font-medium">{getPaymentMethodText(order.paymentMethod)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ngày đặt hàng:</span>
                  <span className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-[#a10000]">
                  <User className="w-5 h-5" />
                  Thông Tin Khách Hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">
                    {order.user?.name || order.guestName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{order.shippingAddress}</span>
                </div>
                {order.user?.email && (
                  <div className="text-gray-600">
                    Email: {order.user.email}
                  </div>
                )}
                {order.guestEmail && (
                  <div className="text-gray-600">
                    Email: {order.guestEmail}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-[#a10000]">
                  <Package className="w-5 h-5" />
                  Sản Phẩm Đã Đặt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
                      <div className="w-16 h-16 flex-shrink-0">
                        <div className="relative w-full h-full rounded-lg bg-gray-50 border overflow-hidden">
                          <Image
                            src={
                              item.product.image ||
                              (item.product.images && item.product.images[0]) ||
                              '/images/placeholder-product.jpg'
                            }
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm line-clamp-2">
                          {item.product.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">x{item.quantity}</span>
                        </div>
                      </div>
                      <div className="font-semibold text-[#a10000] text-sm">
                        {currencyFormatter.format(parseFloat(item.price) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-[#a10000]">
                  <FileText className="w-5 h-5" />
                  Tóm Tắt Đơn Hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-[#a10000]">{currencyFormatter.format(parseFloat(order.total))}</span>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4">
                  <Button asChild className="w-full bg-[#a10000] hover:bg-red-800">
                    <Link href="/products">Tiếp Tục Mua Sắm</Link>
                  </Button>
                  {isAuthenticated && (
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/dashboard/orders">Xem Tất Cả Đơn Hàng</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
