'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SettingsForm } from '@/components/SettingsForm';
import { SettingsReloadCountdown } from '@/components/SettingsReloadCountdown';
import { apiService } from '@/lib/api';
import { SettingsData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showReloadCountdown, setShowReloadCountdown] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

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
      <div className="space-y-8">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Settings Form Skeleton */}
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-10 w-full bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        {/* Error Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trạng thái hệ thống</p>
                  <p className="text-2xl font-bold text-red-600">Lỗi</p>
                </div>
                <div className="p-3 rounded-full bg-red-50">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cài đặt đã lưu</p>
                  <p className="text-2xl font-bold text-gray-900">Không</p>
                </div>
                <div className="p-3 rounded-full bg-gray-50">
                  <Save className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Phiên bản</p>
                  <p className="text-2xl font-bold text-gray-900">1.0.0</p>
                </div>
                <div className="p-3 rounded-full bg-purple-50">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ID cửa hàng</p>
                  <p className="text-lg font-bold text-gray-900">birdnest-shop</p>
                </div>
                <div className="p-3 rounded-full bg-orange-50">
                  <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        <div>
          <h2 
            className="text-2xl font-bold text-[#a10000] mb-6"
          >
            Lỗi tải cài đặt
          </h2>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
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
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trạng thái hệ thống</p>
                  <p className="text-2xl font-bold text-gray-900">Không có</p>
                </div>
                <div className="p-3 rounded-full bg-gray-50">
                  <Settings className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cài đặt đã lưu</p>
                  <p className="text-2xl font-bold text-gray-900">Không</p>
                </div>
                <div className="p-3 rounded-full bg-gray-50">
                  <Save className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Phiên bản</p>
                  <p className="text-2xl font-bold text-gray-900">1.0.0</p>
                </div>
                <div className="p-3 rounded-full bg-purple-50">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ID cửa hàng</p>
                  <p className="text-lg font-bold text-gray-900">birdnest-shop</p>
                </div>
                <div className="p-3 rounded-full bg-orange-50">
                  <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* No Settings Found Message */}
        <div>
          <h2 
            className="text-2xl font-bold text-[#a10000] mb-6"
          >
            Không tìm thấy cài đặt
          </h2>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
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
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trạng thái hệ thống</p>
                <p className="text-2xl font-bold text-gray-900">Hoạt động</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cài đặt đã lưu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lastSaved ? 'Có' : 'Chưa'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <Save className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Phiên bản</p>
                <p className="text-2xl font-bold text-gray-900">1.0.0</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ID cửa hàng</p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {settings.storeName?.toLowerCase().replace(/\s+/g, '-') || 'birdnest-shop'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-50">
                <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Form Section */}
      <div>
        <h2 
          className="text-2xl font-bold text-[#a10000] mb-6"
        >
          Cấu hình hệ thống
        </h2>
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6">
            {/* Settings Form */}
            <SettingsForm
              initialData={settings}
              onSubmit={handleSubmit}
              isLoading={loading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Status Info */}
      {lastSaved && (
        <div className="flex items-center justify-end">
          <div className="text-right">
            <p className="text-sm text-gray-500">Lần lưu cuối</p>
            <p className="text-sm font-medium text-gray-900">
              {lastSaved.toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
      
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