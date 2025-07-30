'use client';
import { Instagram, Phone, Mail, MapPin, Globe, Facebook, ShoppingBag, Music } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSetting } from '@/lib/settings-context';

const companyInfoDescription = '';
// Company info details will be populated dynamically from settings

const policies = [
  { label: 'Chính sách quy định chung', href: '/policy/general' },
  { label: 'Chính sách bảo mật', href: '/policy/privacy' },
  { label: 'Chính sách bảo hành', href: '/policy/warranty' },
  { label: 'Chính sách đổi trả hàng', href: '/policy/returns' },
];

const support = [
  { label: 'Chính sách đặt hàng - thanh toán', href: '/support/order-payment' },
  { label: 'Chính sách vận chuyển - kiểm hàng', href: '/support/shipping' },
  { label: 'Câu hỏi thường gặp', href: '/support/faq' },
];

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/yensaokimsang',
    icon: <Facebook className="w-5 h-5" />,
    color: 'hover:text-blue-400',
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/yensaokimsang',
    icon: <Instagram className="w-5 h-5" />,
    color: 'hover:text-pink-400',
  },
  {
    label: 'Zalo',
    href: 'https://zalo.me/yensaokimsang',
    icon: (
      <Image
        src="/images/zalo-icon.png"
        alt="Zalo"
        width={20}
        height={20}
        className="w-5 h-5"
        aria-label="Zalo"
      />
    ),
    color: 'hover:text-blue-500',
  },
  {
    label: 'Shopee',
    href: 'https://shopee.vn/yensaokimsang',
    icon: <ShoppingBag className="w-5 h-5" />,
    color: 'hover:text-orange-400',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@yensaokimsang',
    icon: <Music className="w-5 h-5" />,
    color: 'hover:text-pink-300',
  },
];

export default function Footer() {
  const [open, setOpen] = useState([false, false, false, false]);
  const [showFB] = useState(false);
  
  // Get settings
  const storeName = useSetting('storeName') || 'Birdnest Shop';
  const storeEmail = useSetting('storeEmail') || 'admin@birdnest.com';
  const storePhone = useSetting('storePhone') || '0919.844.822';
  const address = useSetting('address') || '45 Trần Hưng Đạo, Đảo, Rạch Giá, Kiên Giang';
  const country = useSetting('country') || 'Vietnam';

  useEffect(() => {
    if (
      (showFB || (typeof window !== 'undefined' && window.innerWidth >= 768)) &&
      !document.getElementById('facebook-jssdk')
    ) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.src =
        'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0';
      document.body.appendChild(script);
      if (!document.getElementById('fb-root')) {
        const fbRoot = document.createElement('div');
        fbRoot.id = 'fb-root';
        document.body.prepend(fbRoot);
      }
    }
  }, [showFB]);

  const toggleSection = (index: number) => {
    setOpen((prev) => prev.map((item, i) => (i === index ? !item : item)));
  };

  return (
    <footer className="w-full bg-gradient-to-b from-[#9A030B] to-[#7A0209] text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info - Mobile Collapsible */}
          <div className="space-y-4">
            <button
              onClick={() => toggleSection(0)}
              className="flex items-center justify-between w-full md:hidden text-left"
            >
              <h3 className="font-bold text-lg sm:text-xl">{storeName.toUpperCase()}</h3>
              <span className="text-2xl transition-transform duration-200 md:hidden">
                {open[0] ? '−' : '+'}
              </span>
            </button>
            <h3 className="font-bold text-lg sm:text-xl hidden md:block">
              {storeName.toUpperCase()}
            </h3>

            <div
              className={`space-y-3 ${open[0] ? 'block' : 'hidden md:block'}`}
            >
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                {companyInfoDescription}
              </p>
              
              {/* Address */}
              <div className="flex items-start space-x-2">
                <span className="text-[#e6b17a] mt-0.5">
                  <MapPin className="w-4 h-4 inline mr-1" />
                </span>
                <div className="flex-1">
                  <span className="font-semibold text-sm sm:text-base">
                    Address:
                  </span>
                  <span className="text-[#e6b17a] text-sm sm:text-base block sm:inline sm:ml-1">
                    {address}
                  </span>
                </div>
              </div>

              {/* Phone */}
              {storePhone && (
                <div className="flex items-start space-x-2">
                  <span className="text-[#e6b17a] mt-0.5">
                    <Phone className="w-4 h-4 inline mr-1" />
                  </span>
                  <div className="flex-1">
                    <span className="font-semibold text-sm sm:text-base">
                      Hotline:
                    </span>
                    <span className="text-[#e6b17a] font-semibold text-sm sm:text-base block sm:inline sm:ml-1">
                      <a
                        href={`tel:${storePhone.replace(/\s+/g, '')}`}
                        className="hover:underline transition-colors duration-200"
                      >
                        {storePhone}
                      </a>
                    </span>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="flex items-start space-x-2">
                <span className="text-[#e6b17a] mt-0.5">
                  <Mail className="w-4 h-4 inline mr-1" />
                </span>
                <div className="flex-1">
                  <span className="font-semibold text-sm sm:text-base">
                    Email:
                  </span>
                  <span className="text-[#e6b17a] font-semibold text-sm sm:text-base block sm:inline sm:ml-1">
                    <a
                      href={`mailto:${storeEmail}`}
                      className="hover:underline transition-colors duration-200"
                    >
                      {storeEmail}
                    </a>
                  </span>
                </div>
              </div>

              {/* Website */}
              <div className="flex items-start space-x-2">
                <span className="text-[#e6b17a] mt-0.5">
                  <Globe className="w-4 h-4 inline mr-1" />
                </span>
                <div className="flex-1">
                  <span className="font-semibold text-sm sm:text-base">
                    Website:
                  </span>
                  <span className="text-[#e6b17a] font-semibold text-sm sm:text-base block sm:inline sm:ml-1">
                    <a
                      href="https://birdnest-shop.com"
                      className="hover:underline transition-colors duration-200"
                    >
                      birdnest-shop.com
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Policies - Mobile Collapsible */}
          <div className="space-y-4">
            <button
              onClick={() => toggleSection(1)}
              className="flex items-center justify-between w-full md:hidden text-left"
            >
              <h3 className="font-bold text-lg sm:text-xl">CHÍNH SÁCH</h3>
              <span className="text-2xl transition-transform duration-200 md:hidden">
                {open[1] ? '−' : '+'}
              </span>
            </button>
            <h3 className="font-bold text-lg sm:text-xl hidden md:block">
              CHÍNH SÁCH
            </h3>

            <ul
              className={`space-y-2 ${open[1] ? 'block' : 'hidden md:block'}`}
            >
              {policies.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm sm:text-base text-gray-200 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-1 h-1 bg-[#e6b17a] rounded-full mr-2 group-hover:scale-125 transition-transform duration-200"></span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support - Mobile Collapsible */}
          <div className="space-y-4">
            <button
              onClick={() => toggleSection(2)}
              className="flex items-center justify-between w-full md:hidden text-left"
            >
              <h3 className="font-bold text-lg sm:text-xl">
                HỖ TRỢ KHÁCH HÀNG
              </h3>
              <span className="text-2xl transition-transform duration-200 md:hidden">
                {open[2] ? '−' : '+'}
              </span>
            </button>
            <h3 className="font-bold text-lg sm:text-xl hidden md:block">
              HỖ TRỢ KHÁCH HÀNG
            </h3>

            <ul
              className={`space-y-2 ${open[2] ? 'block' : 'hidden md:block'}`}
            >
              {support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm sm:text-base text-gray-200 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-1 h-1 bg-[#e6b17a] rounded-full mr-2 group-hover:scale-125 transition-transform duration-200"></span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social - Mobile Collapsible */}
          <div className="space-y-4">
            <button
              onClick={() => toggleSection(3)}
              className="flex items-center justify-between w-full md:hidden text-left"
            >
              <h3 className="font-bold text-lg sm:text-xl">
                LIÊN HỆ & MẠNG XÃ HỘI
              </h3>
              <span className="text-2xl transition-transform duration-200 md:hidden">
                {open[3] ? '−' : '+'}
              </span>
            </button>
            <h3 className="font-bold text-lg sm:text-xl hidden md:block">
              LIÊN HỆ & MẠNG XÃ HỘI
            </h3>

            <div
              className={`space-y-4 ${open[3] ? 'block' : 'hidden md:block'}`}
            >
              {/* Social Links */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm sm:text-base text-[#e6b17a]">
                  Theo dõi chúng tôi
                </h4>
                <div className="flex space-x-4">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className={`p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-200 ${link.color}`}
                      aria-label={link.label}
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
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
