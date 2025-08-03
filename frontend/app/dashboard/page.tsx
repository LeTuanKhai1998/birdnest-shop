'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  User, 
  MapPin, 
  Heart, 
  Bell, 
  Package,
  TrendingUp,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/useAuth';

export default function DashboardHome() {
  const { user } = useRequireAuth('/login');

  const quickActions = [
    {
      title: 'Xem đơn hàng',
      description: 'Kiểm tra trạng thái đơn hàng của bạn',
      icon: ShoppingBag,
      href: '/dashboard/orders',
      color: 'bg-blue-500',
      textColor: 'text-blue-500'
    },
    {
      title: 'Cập nhật hồ sơ',
      description: 'Chỉnh sửa thông tin cá nhân',
      icon: User,
      href: '/dashboard/profile',
      color: 'bg-green-500',
      textColor: 'text-green-500'
    },
    {
      title: 'Quản lý địa chỉ',
      description: 'Thêm hoặc chỉnh sửa địa chỉ giao hàng',
      icon: MapPin,
      href: '/dashboard/addresses',
      color: 'bg-purple-500',
      textColor: 'text-purple-500'
    },
    {
      title: 'Danh sách yêu thích',
      description: 'Xem sản phẩm bạn đã yêu thích',
      icon: Heart,
      href: '/dashboard/wishlist',
      color: 'bg-pink-500',
      textColor: 'text-pink-500'
    }
  ];

  const stats = [
    {
      title: 'Tổng đơn hàng',
      value: '12',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Đơn hàng gần đây',
      value: '3',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Đánh giá đã viết',
      value: '8',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Đơn hàng hoàn thành',
      value: '9',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
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
          Chào mừng trở lại, {user?.name || 'Người dùng'}! 👋
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Quản lý đơn hàng, hồ sơ, địa chỉ và danh sách yêu thích của bạn tại một nơi.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 
          className="text-2xl font-bold text-[#a10000] mb-6"
        >
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                <Link
                  href={action.href}
                  className="inline-block bg-glossy text-red-900 font-bold px-6 py-3 rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 hover:shadow-3xl animate-button-zoom button-glow text-sm"
                  style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}
                >
                  Truy cập
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 
          className="text-2xl font-bold text-[#a10000] mb-6"
        >
          Hoạt động gần đây
        </h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Đơn hàng #ORD-2025-001 đã được giao thành công</p>
                  <p className="text-sm text-gray-500">2 giờ trước</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Đơn hàng #ORD-2025-002 đang được xử lý</p>
                  <p className="text-sm text-gray-500">1 ngày trước</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Bạn đã đánh giá sản phẩm "Yến sào tinh chế 100g"</p>
                  <p className="text-sm text-gray-500">3 ngày trước</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border border-red-100">
        <div className="text-center">
          <h2 
            className="text-2xl font-bold text-[#a10000] mb-4"
          >
            Cần hỗ trợ?
          </h2>
          <p className="text-gray-600 mb-6">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Liên hệ với chúng tôi qua các kênh sau:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-block bg-white text-[#a10000] hover:bg-gray-100 font-semibold px-6 py-3 rounded-full transition-all duration-200"
            >
              Liên hệ hỗ trợ
            </Link>
            <Link
              href="/about"
              className="inline-block border-2 border-white text-[#a10000] hover:bg-white hover:text-[#a10000] font-semibold px-6 py-3 rounded-full transition-all duration-200"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
