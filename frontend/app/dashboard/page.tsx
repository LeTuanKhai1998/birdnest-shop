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
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Chào mừng trở lại, {user?.name || 'Người dùng'}! 👋
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Quản lý đơn hàng, hồ sơ, địa chỉ và danh sách yêu thích của bạn tại một nơi.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full ${action.color} bg-opacity-10`}>
                      <Icon className={`w-6 h-6 ${action.textColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={action.href}>
                      Truy cập
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Hoạt động gần đây</h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#a10000]" />
              Lịch sử hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Đơn hàng #12345 đã được giao thành công</p>
                  <p className="text-sm text-gray-500">2 giờ trước</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Hoàn thành
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Đơn hàng #12346 đang được vận chuyển</p>
                  <p className="text-sm text-gray-500">1 ngày trước</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Đang giao
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Star className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Bạn đã đánh giá sản phẩm "Yến sào tinh chế 100g"</p>
                  <p className="text-sm text-gray-500">3 ngày trước</p>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Đánh giá
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-[#a10000] to-red-800 text-white">
        <CardContent className="p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Cần hỗ trợ?</h3>
            <p className="text-red-100 mb-6 max-w-2xl mx-auto">
              Đội ngũ hỗ trợ khách hàng của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" className="bg-white text-[#a10000] hover:bg-gray-100">
                <Link href="/contact">
                  Liên hệ hỗ trợ
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-[#a10000]">
                <Link href="/guest-orders">
                  Tra cứu đơn hàng
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
