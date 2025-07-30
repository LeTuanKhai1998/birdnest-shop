'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, RefreshCw } from 'lucide-react';

interface SettingsReloadCountdownProps {
  isVisible: boolean;
  onCancel: () => void;
  onReload: () => void;
  countdownSeconds?: number;
}

export function SettingsReloadCountdown({ 
  isVisible, 
  onCancel, 
  onReload, 
  countdownSeconds = 3 
}: SettingsReloadCountdownProps) {
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setCountdown(countdownSeconds);
      setIsReloading(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsReloading(true);
          onReload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, countdownSeconds, onReload]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {isReloading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold">Đang tải lại...</h3>
                <p className="text-gray-600">Đang áp dụng cài đặt của bạn trên toàn bộ ứng dụng</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Lưu cài đặt thành công!</h3>
                <p className="text-gray-600 mb-4">
                  Cài đặt cửa hàng của bạn đã được cập nhật. Trang sẽ tải lại trong{' '}
                  <Badge variant="secondary" className="mx-1">
                    {countdown}s
                  </Badge>
                  để áp dụng tất cả thay đổi trên toàn bộ ứng dụng.
                </p>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hủy tải lại
                  </Button>
                  <Button
                    onClick={() => {
                      setIsReloading(true);
                      onReload();
                    }}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tải lại ngay
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 