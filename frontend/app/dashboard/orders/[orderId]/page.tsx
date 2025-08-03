'use client';
import { use, useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Mail,
  Star,
  ShoppingBag,
  Receipt,
  Home,
  Car
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatReadableId } from '@/lib/id-utils';
import Image from 'next/image';

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'DELIVERED':
      return { 
        icon: CheckCircle, 
        color: 'text-green-600', 
        bgColor: 'bg-green-100', 
        borderColor: 'border-green-200',
        text: 'Hoàn thành',
        description: 'Đơn hàng đã được giao thành công',
        gradient: 'from-green-500 to-emerald-500'
      };
    case 'PENDING':
      return { 
        icon: Clock, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-100', 
        borderColor: 'border-blue-200',
        text: 'Đang xử lý',
        description: 'Đơn hàng đang được xử lý',
        gradient: 'from-blue-500 to-cyan-500'
      };
    case 'SHIPPED':
      return { 
        icon: Truck, 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-100', 
        borderColor: 'border-orange-200',
        text: 'Đang giao',
        description: 'Đơn hàng đang được vận chuyển',
        gradient: 'from-orange-500 to-amber-500'
      };
    case 'CANCELLED':
      return { 
        icon: XCircle, 
        color: 'text-red-600', 
        bgColor: 'bg-red-100', 
        borderColor: 'border-red-200',
        text: 'Đã hủy',
        description: 'Đơn hàng đã bị hủy',
        gradient: 'from-red-500 to-pink-500'
      };
    case 'PAID':
      return { 
        icon: CheckCircle, 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-100', 
        borderColor: 'border-purple-200',
        text: 'Đã thanh toán',
        description: 'Đơn hàng đã được thanh toán',
        gradient: 'from-purple-500 to-violet-500'
      };
    default:
      return { 
        icon: Package, 
        color: 'text-gray-600', 
        bgColor: 'bg-gray-100', 
        borderColor: 'border-gray-200',
        text: 'Không xác định',
        description: 'Trạng thái không xác định',
        gradient: 'from-gray-500 to-slate-500'
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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const { isAuthenticated, isLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasFetched = useRef(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const orderData = await apiService.getOrder(orderId);
      setOrder(orderData);
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Reset fetch flag when orderId changes
    if (hasFetched.current) {
      hasFetched.current = false;
      setOrder(null);
      setError('');
    }

    // Only fetch once when we have a stable authenticated state
    if (!isLoading && isAuthenticated && !hasFetched.current) {
      hasFetched.current = true;
      fetchOrder();
    } else if (!isLoading && !isAuthenticated) {
      // If we're not loading and not authenticated, stop loading
      setLoading(false);
    }

    // Cleanup function to prevent race conditions
    return () => {
      isMounted = false;
    };
  }, [orderId, isAuthenticated, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded-lg mb-6 w-1/3"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <Card className="w-96 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Cần đăng nhập
          </h3>
          <p className="text-gray-500 mb-6">
            Vui lòng đăng nhập để xem chi tiết đơn hàng
          </p>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-[#a10000] to-[#c41e3a] hover:from-[#8a0000] hover:to-[#a10000] text-white">
              Đăng nhập
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <Card className="w-96 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Lỗi
          </h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href="/dashboard/orders">
            <Button className="bg-gradient-to-r from-[#a10000] to-[#c41e3a] hover:from-[#8a0000] hover:to-[#a10000] text-white">
              Quay lại đơn hàng
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <Card className="w-96 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Không tìm thấy đơn hàng
          </h3>
          <p className="text-gray-500 mb-6">
            Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa
          </p>
          <Link href="/dashboard/orders">
            <Button className="bg-gradient-to-r from-[#a10000] to-[#c41e3a] hover:from-[#8a0000] hover:to-[#a10000] text-white">
              Quay lại đơn hàng
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard/orders">
              <Button 
                variant="ghost" 
                className="mb-6 text-[#a10000] hover:text-[#8a0000] hover:bg-red-50 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại đơn hàng
              </Button>
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#a10000] to-[#c41e3a] rounded-2xl flex items-center justify-center">
                    <Receipt className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
                    <p className="text-gray-600">Mã đơn hàng: {formatReadableId(order.readableId, order.id)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge className={`${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor} px-4 py-2 border-2 font-semibold text-sm`}>
                  <statusInfo.icon className="w-4 h-4 mr-2" />
                  {statusInfo.text}
                </Badge>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Tổng tiền</p>
                  <p className="text-2xl font-bold text-[#a10000]">{formatVND(Number(order.total))}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-orange-600" />
                    </div>
                    Sản phẩm đã đặt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-300">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          {item.product?.images?.[0] ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              width={80}
                              height={80}
                              className="object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-orange-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {item.product?.name || 'Sản phẩm không xác định'}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              Số lượng: {item.quantity}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              Đơn giá: {formatVND(Number(item.price))}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-[#a10000]">
                            {formatVND(Number(item.price) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    Lịch sử đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-1 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Đơn hàng đã được tạo</p>
                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                        <p className="text-xs text-gray-400 mt-1">Đơn hàng của bạn đã được tiếp nhận</p>
                      </div>
                    </div>
                    
                    {order.status !== 'PENDING' && (
                      <div className="flex items-start gap-4">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Đơn hàng đã được xử lý</p>
                          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                          <p className="text-xs text-gray-400 mt-1">Đơn hàng đang được chuẩn bị</p>
                        </div>
                      </div>
                    )}
                    
                    {order.status === 'SHIPPED' || order.status === 'DELIVERED' ? (
                      <div className="flex items-start gap-4">
                        <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Đơn hàng đang được vận chuyển</p>
                          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                          <p className="text-xs text-gray-400 mt-1">Đơn hàng đang trên đường giao</p>
                        </div>
                      </div>
                    ) : null}
                    
                    {order.status === 'DELIVERED' && (
                      <div className="flex items-start gap-4">
                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Đơn hàng đã được giao</p>
                          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                          <p className="text-xs text-gray-400 mt-1">Đơn hàng đã được giao thành công</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Info */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    Thông tin đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Ngày đặt hàng</p>
                    <p className="font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Phương thức thanh toán</p>
                    <p className="font-semibold text-gray-900">{order.paymentMethod || 'Chưa xác định'}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                    <p className="font-semibold text-gray-900">{statusInfo.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      Địa chỉ giao hàng
                  </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <p className="font-semibold text-gray-900">{order.shippingAddress}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Summary */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#a10000] to-[#c41e3a] rounded-xl flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-white" />
                    </div>
                    Tổng cộng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl">
                      <span className="text-gray-600">Tạm tính</span>
                      <span className="font-semibold">{formatVND(Number(order.total) - (order.deliveryFee || 0))}</span>
                    </div>
                    {order.deliveryFee && (
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl">
                        <span className="text-gray-600">Phí vận chuyển</span>
                        <span className="font-semibold">{formatVND(order.deliveryFee)}</span>
                      </div>
                    )}
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#a10000] to-[#c41e3a] rounded-xl text-white">
                      <span className="font-bold text-lg">Tổng cộng</span>
                      <span className="font-bold text-xl">{formatVND(Number(order.total))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
