'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle } from 'lucide-react';
import { ScaleInSection, SlideUpSection } from '@/components/ui/ScrollAnimation';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubscribed(true);
    setIsLoading(false);
    setEmail('');
    setName('');
  };

  if (isSubscribed) {
    return (
      <section className="w-full bg-gradient-to-r from-red-50 to-orange-50 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <ScaleInSection className="max-w-md mx-auto text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-2xl font-bold mb-2 text-green-700">
              Đăng Ký Thành Công!
            </h3>
            <p className="text-gray-600 mb-6">
              Cảm ơn bạn đã đăng ký nhận thông tin. Chúng tôi sẽ gửi những cập nhật mới nhất về sản phẩm và khuyến mãi.
            </p>
            <Button
              onClick={() => setIsSubscribed(false)}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Đăng Ký Thêm Email Khác
            </Button>
          </ScaleInSection>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-gradient-to-r from-red-50 to-orange-50 py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <ScaleInSection className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 hover:shadow-2xl transition-all duration-300">
            <Mail className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <SlideUpSection>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-red-700">
                Nhận Thông Tin Mới Nhất
              </h2>
            </SlideUpSection>
            <SlideUpSection delay={0.2}>
              <p className="text-gray-600 mb-6">
                Đăng ký để nhận thông tin về sản phẩm mới, khuyến mãi đặc biệt và các mẹo chăm sóc sức khỏe từ Yến Sào Kim Sang.
              </p>
            </SlideUpSection>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="Họ và tên"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-red-200 focus:border-red-500"
                />
                <Input
                  type="email"
                  placeholder="Email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-red-200 focus:border-red-500"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 transition-all duration-300 hover:scale-105"
              >
                {isLoading ? 'Đang đăng ký...' : 'Đăng Ký Ngay'}
              </Button>
            </form>
            
            <p className="text-xs text-gray-500 mt-4">
              Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Bạn có thể hủy đăng ký bất cứ lúc nào.
            </p>
          </div>
        </ScaleInSection>
      </div>
    </section>
  );
} 