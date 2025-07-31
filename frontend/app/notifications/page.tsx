'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function NotificationsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new notifications page in dashboard
    router.replace('/dashboard/notifications');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white flex items-center justify-center">
      <Card className="w-96 p-8 text-center">
        <Loader2 className="w-12 h-12 text-[#a10000] mx-auto mb-4 animate-spin" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang chuyển hướng...</h3>
        <p className="text-gray-600">Chuyển hướng đến trang thông báo mới</p>
      </Card>
    </div>
  );
} 