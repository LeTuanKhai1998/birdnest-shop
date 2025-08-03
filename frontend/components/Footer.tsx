'use client';
import { Instagram, Phone, Mail, MapPin, Globe, Facebook, ShoppingBag, Music } from 'lucide-react';
import Image from 'next/image';
import { useSetting } from '@/lib/settings-context';

export default function Footer() {
  // Get settings
  const storeName = useSetting('storeName') || 'Birdnest Shop';
  const storeEmail = useSetting('storeEmail') || 'admin@birdnest.com';
  const storePhone = useSetting('storePhone') || '0919.844.822';
  const address = useSetting('address') || '45 Trần Hưng Đạo, Đảo, Rạch Giá, Kiên Giang';
  const logoUrl = useSetting('logoUrl') || '/images/logo.png';

  return (
    <footer className="w-full bg-gradient-to-b from-[#9A030B] to-[#7A0209] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src={logoUrl}
                  alt={`${storeName} Logo`}
                  fill
                  className="object-contain"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/logo.png';
                  }}
                />
              </div>
              <h3 className="text-lg font-bold text-white border-b border-white/20 pb-2 mb-0 flex items-center h-12">{storeName.toUpperCase()}</h3>
            </div>
            <p className="text-gray-200 text-sm mt-2">
              Chuyên cung cấp yến sào chất lượng cao, đảm bảo 100% tự nhiên và an toàn cho sức khỏe.
            </p>
            {/* Social Media */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-[#e6b17a]">
                Theo dõi chúng tôi:
              </h4>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/yensaokimsang" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-200 hover:text-blue-400">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://instagram.com/yensaokimsang" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-200 hover:text-pink-400">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://zalo.me/yensaokimsang" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-200 hover:text-blue-500">
                  <Image
                    src="/images/zalo-icon.png"
                    alt="Zalo"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                    aria-label="Zalo"
                  />
                </a>
                <a href="https://shopee.vn/yensaokimsang" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-200 hover:text-orange-400">
                  <ShoppingBag className="w-5 h-5" />
                </a>
                <a href="https://www.tiktok.com/@yensaokimsang" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-200 hover:text-pink-300">
                  <Music className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-white/20 pb-2">
              LIÊN KẾT NHANH
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-200 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-[#e6b17a] rounded-full mr-2 group-hover:scale-125 transition-transform duration-200"></span>
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="/products" className="text-gray-200 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-[#e6b17a] rounded-full mr-2 group-hover:scale-125 transition-transform duration-200"></span>
                  Sản phẩm
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-200 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-[#e6b17a] rounded-full mr-2 group-hover:scale-125 transition-transform duration-200"></span>
                  Giới thiệu
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-200 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-[#e6b17a] rounded-full mr-2 group-hover:scale-125 transition-transform duration-200"></span>
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="/guest-orders" className="text-gray-200 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-[#e6b17a] rounded-full mr-2 group-hover:scale-125 transition-transform duration-200"></span>
                  Tra cứu đơn hàng
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-white/20 pb-2">
              HỖ TRỢ KHÁCH HÀNG
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/support/order-payment" className="text-gray-200 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-[#e6b17a] rounded-full mr-2 group-hover:scale-125 transition-transform duration-200"></span>
                  Chính sách đặt hàng - thanh toán
                </a>
              </li>
                              <li>
                  <a href="/support/shipping" className="text-gray-200 hover:text-white transition-colors duration-200 flex items-center group">
                    <span className="w-1 h-1 bg-[#e6b17a] rounded-full mr-2 group-hover:scale-125 transition-transform duration-200"></span>
                    <span className="whitespace-nowrap">Chính sách vận chuyển - kiểm hàng</span>
                  </a>
                </li>
              <li>
                <a href="/support/faq" className="text-gray-200 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-[#e6b17a] rounded-full mr-2 group-hover:scale-125 transition-transform duration-200"></span>
                  Câu hỏi thường gặp
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-white/20 pb-2">
              LIÊN HỆ
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#e6b17a] mt-0.5" />
                <span className="text-gray-200 text-sm whitespace-nowrap inline">{address}</span>
              </div>
              <div className="flex items-start space-x-2">
                <Phone className="w-4 h-4 text-[#e6b17a] mt-0.5" />
                <a href={`tel:${storePhone.replace(/\s+/g, '')}`} className="text-gray-200 text-sm hover:text-white transition-colors duration-200">
                  {storePhone}
                </a>
              </div>
              <div className="flex items-start space-x-2">
                <Mail className="w-4 h-4 text-[#e6b17a] mt-0.5" />
                <a href={`mailto:${storeEmail}`} className="text-gray-200 text-sm hover:text-white transition-colors duration-200">
                  {storeEmail}
                </a>
              </div>
              <div className="flex items-start space-x-2">
                <Globe className="w-4 h-4 text-[#e6b17a] mt-0.5" />
                <a href="https://birdnest-shop.com" className="text-gray-200 text-sm hover:text-white transition-colors duration-200">
                  birdnest-shop.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20 bg-[#7A0209]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <p className="text-xs sm:text-sm text-gray-300 text-center sm:text-left">
              © 2025 {storeName.toUpperCase()}. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-xs sm:text-sm text-gray-300">
              <span>Made with ❤️ in Vietnam</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
