'use client';

import { useNotifications } from '@/lib/notification-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, CreditCard, Settings, Gift, Bell, Check, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
      return 'text-blue-600 bg-blue-50';
    case 'STOCK':
      return 'text-orange-600 bg-orange-50';
    case 'PAYMENT':
      return 'text-green-600 bg-green-50';
    case 'SYSTEM':
      return 'text-gray-600 bg-gray-50';
    case 'PROMOTION':
      return 'text-purple-600 bg-purple-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export default function NotificationsPage() {
  const { notifications, isLoading, error, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
              <p>Error loading notifications: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

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

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#a10000]">Tất cả thông báo</h2>
            <p className="text-gray-600 mt-1">
              {notifications.length} thông báo tổng cộng
            </p>
          </div>
          {unreadNotifications.length > 0 && (
            <Button 
              onClick={handleMarkAllAsRead} 
              variant="outline"
              className="bg-[#a10000] hover:bg-red-800 text-white border-[#a10000]"
            >
              <Check className="w-4 h-4 mr-2" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        {/* Unread Notifications */}
        {unreadNotifications.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#a10000] mb-4">
              Chưa đọc ({unreadNotifications.length})
            </h3>
            <div className="space-y-4">
              {unreadNotifications.map((notification) => (
                <Card key={notification.id} className="border-l-4 border-l-[#a10000]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {notification.title}
                          </h4>
                          {notification.body && (
                            <p className="text-gray-600 text-sm mb-2">
                              {notification.body}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: require('date-fns/locale/vi') })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="hover:bg-[#a10000]/10 hover:text-[#a10000]"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Read Notifications */}
        {readNotifications.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-[#a10000] mb-4">
              Đã đọc ({readNotifications.length})
            </h3>
            <div className="space-y-4">
              {readNotifications.map((notification) => (
                <Card key={notification.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {notification.title}
                          </h4>
                          {notification.body && (
                            <p className="text-gray-600 text-sm mb-2">
                              {notification.body}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: require('date-fns/locale/vi') })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có thông báo</h3>
              <p className="text-gray-600">
                Bạn chưa có thông báo nào. Chúng tôi sẽ thông báo khi có cập nhật mới!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 