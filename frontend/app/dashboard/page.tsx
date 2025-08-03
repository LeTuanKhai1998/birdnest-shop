'use client';
import { useState, useEffect } from 'react';
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
  CheckCircle,
  ArrowRight,
  Activity,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { fetchUserAddresses, fetchUserWishlist, fetchUserNotifications } from '@/lib/api';

interface DashboardData {
  stats: {
    totalOrders: number;
    recentOrders: number;
    totalReviews: number;
    completedOrders: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    time: string;
    status: string;
  }>;
  quickActions: Array<{
    title: string;
    description: string;
    href: string;
    count?: string;
  }>;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

interface Review {
  id: string;
  product?: {
    name: string;
  };
  createdAt: string;
}

export default function DashboardHome() {
  const { user } = useRequireAuth('/login');
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user orders
      const orders: Order[] = await apiService.getMyOrders();
      
      // Fetch user reviews
      const reviews: Review[] = await apiService.getUserReviews(user?.id || '');
      
      // Fetch user addresses
      const addresses = await fetchUserAddresses();
      
      // Fetch user wishlist
      const wishlist = await fetchUserWishlist();
      
      // Fetch user notifications
      const notifications = await fetchUserNotifications();

      // Calculate stats
      const totalOrders = orders.length;
      const recentOrders = orders.filter((order: Order) => {
        const orderDate = new Date(order.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate > weekAgo;
      }).length;
      
      const completedOrders = orders.filter((order: Order) => 
        order.status === 'completed' || order.status === 'delivered'
      ).length;
      
      const totalReviews = reviews.length;

      // Process recent orders for activities
      const recentActivities = orders.slice(0, 3).map((order: Order) => ({
        id: order.id,
        type: 'order',
        title: `Đơn hàng ${order.orderNumber} ${getOrderStatusText(order.status)}`,
        time: formatRelativeTime(order.createdAt),
        status: order.status
      }));

      // Add review activity if exists
      if (reviews.length > 0) {
        const latestReview = reviews[0];
        recentActivities.unshift({
          id: `review-${latestReview.id}`,
          type: 'review',
          title: `Bạn đã đánh giá sản phẩm "${latestReview.product?.name || 'Sản phẩm'}"`,
          time: formatRelativeTime(latestReview.createdAt),
          status: 'reviewed'
        });
      }

      // Prepare quick actions with real counts
      const quickActions = [
        {
          title: 'Xem đơn hàng',
          description: 'Kiểm tra trạng thái và lịch sử đơn hàng',
          href: '/dashboard/orders',
          count: recentOrders > 0 ? `${recentOrders} đơn gần đây` : undefined
        },
        {
          title: 'Cập nhật hồ sơ',
          description: 'Chỉnh sửa thông tin cá nhân và bảo mật',
          href: '/dashboard/profile'
        },
        {
          title: 'Quản lý địa chỉ',
          description: 'Thêm hoặc chỉnh sửa địa chỉ giao hàng',
          href: '/dashboard/addresses',
          count: addresses.length > 0 ? `${addresses.length} địa chỉ` : undefined
        },
        {
          title: 'Danh sách yêu thích',
          description: 'Xem và quản lý sản phẩm yêu thích',
          href: '/dashboard/wishlist',
          count: wishlist.length > 0 ? `${wishlist.length} sản phẩm` : undefined
        }
      ];

      const data: DashboardData = {
        stats: {
          totalOrders,
          recentOrders,
          totalReviews,
          completedOrders
        },
        recentOrders: orders.slice(0, 5),
        recentActivities: recentActivities.slice(0, 3),
        quickActions
      };

      setDashboardData(data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu dashboard. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'đang chờ xử lý';
      case 'processing': return 'đang được xử lý';
      case 'shipped': return 'đã gửi hàng';
      case 'delivered': return 'đã giao thành công';
      case 'completed': return 'đã hoàn thành';
      case 'cancelled': return 'đã hủy';
      default: return 'đang xử lý';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} tuần trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered': return 'bg-green-500';
      case 'processing':
      case 'shipped': return 'bg-blue-500';
      case 'reviewed': return 'bg-yellow-500';
      case 'pending': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered': return CheckCircle;
      case 'processing':
      case 'shipped': return Clock;
      case 'reviewed': return Star;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#a10000] via-[#c41e3a] to-[#e74c3c] p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Đang tải dữ liệu...
              </h1>
              <p className="text-white/90 text-sm md:text-base">
                Vui lòng chờ trong giây lát
              </p>
            </div>
          </div>
        </div>

        {/* Loading Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        {/* Error Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-red-600 p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Có lỗi xảy ra
              </h1>
              <p className="text-white/90 text-sm md:text-base">
                Không thể tải dữ liệu dashboard
              </p>
            </div>
          </div>
          <p className="text-white/80 max-w-2xl">
            {error}
          </p>
        </div>

        {/* Error Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Không thể tải dữ liệu
            </h3>
            <p className="text-gray-600 mb-8">
              {error}
            </p>
            <Button onClick={loadDashboardData} className="bg-[#a10000] hover:bg-[#c41e3a]">
              <Loader2 className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const stats = [
    {
      title: 'Tổng đơn hàng',
      value: dashboardData.stats.totalOrders.toString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+2.5%',
      trendUp: true
    },
    {
      title: 'Đơn hàng gần đây',
      value: dashboardData.stats.recentOrders.toString(),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Đánh giá đã viết',
      value: dashboardData.stats.totalReviews.toString(),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      trend: '+5.2%',
      trendUp: true
    },
    {
      title: 'Đơn hàng hoàn thành',
      value: dashboardData.stats.completedOrders.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+8.1%',
      trendUp: true
    }
  ];

  const quickActionIcons = [ShoppingBag, User, MapPin, Heart];
  const quickActionColors = [
    'bg-gradient-to-br from-blue-500 to-blue-600',
    'bg-gradient-to-br from-green-500 to-green-600',
    'bg-gradient-to-br from-purple-500 to-purple-600',
    'bg-gradient-to-br from-pink-500 to-pink-600'
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header with improved design */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#a10000] via-[#c41e3a] to-[#e74c3c] p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Chào mừng trở lại, {user?.name || 'Người dùng'}! 👋
              </h1>
              <p className="text-white/90 text-sm md:text-base">
                Quản lý tài khoản của bạn một cách dễ dàng
              </p>
            </div>
          </div>
          <p className="text-white/80 max-w-2xl">
            Theo dõi đơn hàng, cập nhật hồ sơ, quản lý địa chỉ và danh sách yêu thích của bạn tại một nơi.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 text-sm font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className={`w-4 h-4 ${stat.trendUp ? 'rotate-0' : 'rotate-180'}`} />
                    {stat.trend}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Thao tác nhanh</h2>
          <Link 
            href="/dashboard" 
            className="text-sm font-medium text-[#a10000] hover:text-[#c41e3a] transition-colors flex items-center gap-1"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardData.quickActions.map((action, index) => {
            const Icon = quickActionIcons[index];
            const color = quickActionColors[index];
            
            return (
              <Link key={index} href={action.href}>
                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {action.count && (
                        <Badge variant="secondary" className="text-xs">
                          {action.count}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#a10000] transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Enhanced Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Hoạt động gần đây</h2>
          <Link 
            href="/dashboard/orders" 
            className="text-sm font-medium text-[#a10000] hover:text-[#c41e3a] transition-colors flex items-center gap-1"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-6">
              {dashboardData.recentActivities.map((activity, index) => {
                const Icon = getStatusIcon(activity.status);
                
                // Determine the link based on activity type
                const getActivityLink = (activity: any) => {
                  if (activity.type === 'order') {
                    return `/dashboard/orders/${activity.id}`;
                  } else if (activity.type === 'review') {
                    return `/dashboard/reviews`; // or specific review page if available
                  }
                  return '#';
                };

                const activityLink = getActivityLink(activity);
                
                return (
                  <Link key={activity.id} href={activityLink}>
                    <div className="flex items-start gap-4 group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200 cursor-pointer">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(activity.status)} mt-2 flex-shrink-0`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <p className="font-medium text-gray-900 group-hover:text-[#a10000] transition-colors">
                            {activity.title}
                          </p>
                          <ArrowRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Help Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Cần hỗ trợ?</h2>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#a10000] rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Chúng tôi luôn sẵn sàng hỗ trợ bạn
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Liên hệ với chúng tôi qua các kênh sau để được hỗ trợ nhanh chóng và hiệu quả.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#a10000] text-white font-semibold rounded-lg hover:bg-[#c41e3a] transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Liên hệ hỗ trợ
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#a10000] text-[#a10000] font-semibold rounded-lg hover:bg-[#a10000] hover:text-white transition-all duration-200"
                >
                  Tìm hiểu thêm
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
