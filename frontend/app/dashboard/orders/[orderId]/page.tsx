'use client';
import { use, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Truck, 
  XCircle, 
  Clock, 
  Package, 
  MapPin, 
  User, 
  FileText,
  ArrowLeft,
  Calendar,
  CreditCard,
  Phone,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/api';
import { Order } from '@/lib/types';
import Image from 'next/image';

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'DELIVERED':
      return { 
        icon: CheckCircle, 
        color: 'text-green-600', 
        bgColor: 'bg-green-100', 
        text: 'Hoàn thành',
        description: 'Đơn hàng đã được giao thành công'
      };
    case 'PENDING':
      return { 
        icon: Clock, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-100', 
        text: 'Đang xử lý',
        description: 'Đơn hàng đang được xử lý'
      };
    case 'SHIPPED':
      return { 
        icon: Truck, 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-100', 
        text: 'Đang giao',
        description: 'Đơn hàng đang được vận chuyển'
      };
    case 'CANCELLED':
      return { 
        icon: XCircle, 
        color: 'text-red-600', 
        bgColor: 'bg-red-100', 
        text: 'Đã hủy',
        description: 'Đơn hàng đã bị hủy'
      };
    case 'PAID':
      return { 
        icon: CheckCircle, 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-100', 
        text: 'Đã thanh toán',
        description: 'Đơn hàng đã được thanh toán'
      };
    default:
      return { 
        icon: Package, 
        color: 'text-gray-600', 
        bgColor: 'bg-gray-100', 
        text: 'Không xác định',
        description: 'Trạng thái không xác định'
      };
  }
};

function formatVND(amount: number) {
  return amount.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const { user, isAuthenticated, isLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const orderData = await apiService.getOrder(orderId);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchOrder();
    }
  }, [orderId, isAuthenticated, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Đang tải đơn hàng...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 font-semibold">Vui lòng đăng nhập để xem đơn hàng.</div>
        <Link href="/login">
          <Button className="mt-4">Đăng nhập</Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 font-semibold">{error}</div>
        <Link href="/dashboard/orders">
          <Button className="mt-4">Quay lại đơn hàng</Button>
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 font-semibold">Không tìm thấy đơn hàng.</div>
        <Link href="/dashboard/orders">
          <Button className="mt-4">Quay lại đơn hàng</Button>
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/orders">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại đơn hàng
          </Button>
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
            <p className="text-gray-600">Mã đơn hàng: {order.id}</p>
          </div>
          <Badge className={`${statusInfo.bgColor} ${statusInfo.color} px-3 py-1`}>
            <statusInfo.icon className="w-4 h-4 mr-2" />
            {statusInfo.text}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Sản phẩm đã đặt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    {item.product?.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{item.product?.name || 'Sản phẩm không xác định'}</h3>
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                      <p className="text-sm text-gray-500">Đơn giá: {formatVND(Number(item.price))}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatVND(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Lịch sử đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Đơn hàng đã được tạo</p>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                {order.status !== 'PENDING' && (
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Đơn hàng đã được xử lý</p>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                )}
                {order.status === 'SHIPPED' || order.status === 'DELIVERED' ? (
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Đơn hàng đang được vận chuyển</p>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                ) : null}
                {order.status === 'DELIVERED' && (
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Đơn hàng đã được giao</p>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Thông tin đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Ngày đặt hàng</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                <p className="font-medium">{order.paymentMethod || 'Chưa xác định'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <p className="font-medium">{statusInfo.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Địa chỉ giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{order.shippingAddress}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tổng cộng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{formatVND(Number(order.total) - (order.deliveryFee || 0))}</span>
                </div>
                {order.deliveryFee && (
                  <div className="flex justify-between">
                    <span>Phí vận chuyển</span>
                    <span>{formatVND(order.deliveryFee)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-[#a10000]">{formatVND(Number(order.total))}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
