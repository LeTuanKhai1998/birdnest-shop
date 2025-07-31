'use client';

import { useNotifications } from '@/lib/notification-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  AlertTriangle, 
  CreditCard, 
  Settings, 
  Gift, 
  Bell, 
  Check, 
  Trash2, 
  Search, 
  Loader2,
  XCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'ORDER':
      return <Package className="w-5 h-5" />;
    case 'STOCK':
      return <AlertTriangle className="w-5 h-5" />;
    case 'PAYMENT':
      return <CreditCard className="w-5 h-5" />;
    case 'SYSTEM':
      return <Settings className="w-5 h-5" />;
    case 'PROMOTION':
      return <Gift className="w-5 h-5" />;
    default:
      return <Bell className="w-5 h-5" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'ORDER':
      return { text: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' };
    case 'STOCK':
      return { text: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' };
    case 'PAYMENT':
      return { text: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' };
    case 'SYSTEM':
      return { text: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' };
    case 'PROMOTION':
      return { text: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' };
    default:
      return { text: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' };
  }
};

export default function NotificationsPage() {
  const { user } = useRequireAuth('/login');
  const { notifications, isLoading, error, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
  };

  // Filter notifications based on search and filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (notification.body && notification.body.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesRead = filterRead === 'all' || 
                       (filterRead === 'unread' && !notification.isRead) ||
                       (filterRead === 'read' && notification.isRead);
    
    return matchesSearch && matchesType && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!user) {
    return (
      <Card className="p-8">
        <CardContent className="text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang tải...</h3>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-8">
        <CardContent className="text-center">
          <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang tải thông báo...</h3>
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
          <p className="text-gray-600 mb-4">Không thể tải thông báo: {error}</p>
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
          Thông báo
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Cập nhật về đơn hàng, khuyến mãi và thông tin quan trọng
        </p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm thông báo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterRead === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterRead('all')}
                className={filterRead === 'all' 
                  ? "bg-gray-600 hover:bg-gray-700 text-white" 
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }
              >
                Tất cả
              </Button>
              <Button
                variant={filterRead === 'unread' ? 'default' : 'outline'}
                onClick={() => setFilterRead('unread')}
                className={filterRead === 'unread' 
                  ? "bg-[#a10000] hover:bg-red-800 text-white" 
                  : "border-red-300 text-red-700 hover:bg-red-50"
                }
              >
                Chưa đọc ({unreadCount})
              </Button>
              <Button
                variant={filterRead === 'read' ? 'default' : 'outline'}
                onClick={() => setFilterRead('read')}
                className={filterRead === 'read' 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "border-green-300 text-green-700 hover:bg-green-50"
                }
              >
                Đã đọc
              </Button>
            </div>
          </div>
          
          {/* Type Filter */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
              className={filterType === 'all' 
                ? "bg-gray-600 hover:bg-gray-700 text-white" 
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }
            >
              Tất cả loại
            </Button>
            <Button
              variant={filterType === 'ORDER' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('ORDER')}
              className={filterType === 'ORDER' 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "border-blue-300 text-blue-700 hover:bg-blue-50"
              }
            >
              <Package className="w-4 h-4 mr-1" />
              Đơn hàng
            </Button>
            <Button
              variant={filterType === 'PROMOTION' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('PROMOTION')}
              className={filterType === 'PROMOTION' 
                ? "bg-purple-600 hover:bg-purple-700 text-white" 
                : "border-purple-300 text-purple-700 hover:bg-purple-50"
              }
            >
              <Gift className="w-4 h-4 mr-1" />
              Khuyến mãi
            </Button>
            <Button
              variant={filterType === 'PAYMENT' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('PAYMENT')}
              className={filterType === 'PAYMENT' 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "border-green-300 text-green-700 hover:bg-green-50"
              }
            >
              <CreditCard className="w-4 h-4 mr-1" />
              Thanh toán
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button 
            onClick={handleMarkAllAsRead} 
            variant="outline"
            className="bg-[#a10000] hover:bg-red-800 text-white border-[#a10000]"
          >
            <Check className="w-4 h-4 mr-2" />
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
      )}

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có thông báo</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' || filterRead !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Bạn chưa có thông báo nào. Chúng tôi sẽ thông báo khi có cập nhật mới!'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredNotifications.map((notification) => {
            const colorInfo = getNotificationColor(notification.type);
            return (
              <Card 
                key={notification.id} 
                className={`hover:shadow-lg transition-all duration-200 ${
                  !notification.isRead ? 'border-l-4 border-l-[#a10000]' : 'opacity-75'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-full ${colorInfo.bg} ${colorInfo.border}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <Badge className="bg-[#a10000] text-white text-xs">
                              Mới
                            </Badge>
                          )}
                          <Badge variant="outline" className={`${colorInfo.text} ${colorInfo.border}`}>
                            {notification.type}
                          </Badge>
                        </div>
                        {notification.body && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {notification.body}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), { 
                            addSuffix: true
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="hover:bg-[#a10000]/10 hover:text-[#a10000]"
                          title="Đánh dấu đã đọc"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        className="text-red-500 hover:bg-red-50"
                        title="Xóa thông báo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {filteredNotifications.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>
                Hiển thị {filteredNotifications.length} trong tổng số {notifications.length} thông báo
              </span>
              <span>
                {unreadCount} chưa đọc
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 