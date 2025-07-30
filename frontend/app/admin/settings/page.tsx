'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { SettingsForm } from '@/components/SettingsForm';
import { SettingsReloadCountdown } from '@/components/SettingsReloadCountdown';
import { apiService } from '@/lib/api';
import { SettingsData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showReloadCountdown, setShowReloadCountdown] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      router.push('/login?callbackUrl=/admin');
      return;
    }

    const userData = JSON.parse(user);
    if (!userData.isAdmin) {
      router.push('/login?callbackUrl=/admin');
      return;
    }

    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSettings();
      setSettings(data);
      toast({
        title: "Tải cài đặt thành công",
        description: "Cài đặt cửa hàng của bạn đã được tải thành công.",
        variant: "success",
      });
    } catch (err) {
      console.error('Error loading settings:', err);
      const errorMessage = 'Không thể tải cài đặt. Vui lòng thử lại.';
      setError(errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: SettingsData) => {
    try {
      setLoading(true);
      const updatedSettings = await apiService.updateSettings(data);
      setSettings(updatedSettings);
      setLastSaved(new Date());
      
      toast({
        title: "Lưu cài đặt thành công!",
        description: "Cài đặt cửa hàng của bạn đã được cập nhật.",
        variant: "success",
        duration: 2000,
      });
      
      // Show reload countdown after successful save
      setShowReloadCountdown(true);
    } catch (err) {
      console.error('Error saving settings:', err);
      const errorMessage = 'Không thể lưu cài đặt. Vui lòng thử lại.';
      setError(errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleCancelReload = () => {
    setShowReloadCountdown(false);
  };

  if (loading && !settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Đang tải cài đặt</h3>
              <p className="text-gray-600">Vui lòng chờ trong khi chúng tôi tải cấu hình cửa hàng...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-red-600">Lỗi tải cài đặt</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={loadSettings} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy cài đặt</h3>
              <p className="text-gray-600">Không tìm thấy cấu hình cài đặt.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Settings className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                                  <h1 className="text-3xl font-bold text-gray-900">Cài đặt cửa hàng</h1>
                <p className="text-gray-600 mt-1">
                  Cấu hình cài đặt cửa hàng, phương thức thanh toán và tùy chọn hệ thống.
                </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {lastSaved && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Lần lưu cuối</p>
                    <p className="text-sm font-medium text-gray-900">
                      {lastSaved.toLocaleTimeString()}
                    </p>
                  </div>
                )}
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Hoạt động
                </Badge>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <SettingsForm
            initialData={settings}
            onSubmit={handleSubmit}
            isLoading={loading}
          />

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>ID cửa hàng: {settings.storeName?.toLowerCase().replace(/\s+/g, '-') || 'birdnest-shop'}</span>
                <span>•</span>
                <span>Phiên bản: 1.0.0</span>
              </div>
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                <span>Tự động lưu đã bật</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <Toaster />
      
      {/* Reload Countdown Modal */}
      <SettingsReloadCountdown
        isVisible={showReloadCountdown}
        onCancel={handleCancelReload}
        onReload={handleReload}
        countdownSeconds={3}
      />
    </div>
  );
} 