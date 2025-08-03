'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Package, Calendar, User, Phone, Mail, Eye, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { formatReadableId } from '@/lib/id-utils';

interface GuestOrder {
  id: string;
  readableId?: string;
  createdAt: string;
  status: string;
  total: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  shippingAddress: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
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
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders/guest/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể tìm kiếm đơn hàng');
      }

      const data = await response.json();
      setOrders(data);
      setSearched(true);
    } catch (error) {
      console.error('Error searching orders:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tìm kiếm đơn hàng');
      setOrders([]);
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

  const clearSearch = () => {
    setQuery('');
    setOrders([]);
    setSearched(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white">
      {/* Page Header - Full width like Home page */}
      <section
        className="relative w-full bg-[#a10000] overflow-hidden lg:bg-[#a10000] bg-gradient-to-b from-[#a10000] to-[#fbd8b0]"
        style={{ minHeight: '600px' }}
      >
        {/* Background Image - Desktop */}
        <Image
          src="/images/bg_banner_top.jpg"
          alt="Banner Background"
          fill
          className="object-cover w-full h-full hidden lg:block"
          priority
          quality={100}
          sizes="100vw"
          style={{ zIndex: 0, objectPosition: 'center 30%' }}
        />

        {/* Background Image - Mobile */}
        <Image
          src="/images/bg_banner_top_mobile.jpg"
          alt="Banner Background Mobile"
          fill
          className="object-cover w-full h-full lg:hidden"
          priority
          quality={100}
          sizes="100vw"
          style={{ zIndex: 0, objectPosition: 'center top' }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center" style={{ minHeight: '600px' }}>
          <div className="text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Tra cứu đơn hàng
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Nhập email hoặc số điện thoại để kiểm tra đơn hàng của bạn (cả khách và tài khoản đã đăng ký)
            </p>
          </div>
        </div>
      </section>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-xl mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#a10000] mb-2 flex items-center justify-center gap-2">
                <Search className="h-6 w-6" />
                Tìm kiếm đơn hàng
              </h2>
              <p className="text-gray-600">Nhập email hoặc số điện thoại để tra cứu (hoạt động cho cả khách và tài khoản đã đăng ký)</p>
            </div>
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                type="text"
                placeholder="Nhập email hoặc số điện thoại..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 border-2 border-gray-200 focus:border-[#a10000] rounded-xl"
                minLength={3}
                required
                disabled={loading}
              />
              <Button 
                type="submit" 
                disabled={loading || !query.trim()}
                className="bg-[#a10000] hover:bg-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang tìm...' : 'Tìm kiếm'}
              </Button>
              {searched && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={clearSearch}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Xóa
                </Button>
              )}
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searched && !error && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Kết quả tìm kiếm ({orders.length} đơn hàng)
                </h2>
                {orders.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Tìm thấy {orders.length} đơn hàng cho "{query}"
                  </p>
                )}
              </div>

              {orders.length === 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Không tìm thấy đơn hàng
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Không tìm thấy đơn hàng nào với thông tin đã nhập.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Vui lòng kiểm tra lại email hoặc số điện thoại.
                    </p>
                    <Button 
                      onClick={clearSearch}
                      className="bg-[#a10000] hover:bg-red-800 text-white"
                    >
                      Thử lại
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <CardHeader className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-semibold text-lg text-[#a10000]">
                                Đơn hàng #{formatReadableId(order.readableId, order.id)}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(order.createdAt)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {order.guestName || order.user?.name}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                            <div className="text-lg font-bold text-[#a10000] mt-1">
                              {formatCurrency(order.total)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 pb-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2 text-gray-900">Thông tin liên hệ</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700">{order.guestEmail || order.user?.email}</span>
                              </div>
                              {order.guestPhone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-500" />
                                  <span className="text-gray-700">{order.guestPhone}</span>
                                </div>
                              )}
                              {order.user && (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span className="text-gray-700">Tài khoản đã đăng ký</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2 text-gray-900">Địa chỉ giao hàng</h4>
                            <p className="text-sm text-gray-700">
                              {order.shippingAddress}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3 text-gray-900">Sản phẩm đã đặt</h4>
                          <div className="space-y-3">
                            {order.orderItems.map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  {item.product.images[0] && (
                                    <div className="w-12 h-12 flex-shrink-0">
                                      <div className="relative w-full h-full rounded-lg bg-gray-100 border overflow-hidden">
                                        <img
                                          src={item.product.images[0].url}
                                          alt={item.product.name}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-medium text-sm text-gray-900">{item.product.name}</span>
                                    <div className="text-xs text-gray-500">Số lượng: {item.quantity}</div>
                                  </div>
                                </div>
                                <span className="font-semibold text-[#a10000] text-sm">
                                  {formatCurrency(item.price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                          <Button asChild className="bg-[#a10000] hover:bg-red-800 text-white">
                            <Link href={`/order/${order.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              Xem chi tiết
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
} 