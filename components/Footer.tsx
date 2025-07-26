"use client";
import { Instagram, Phone, Mail, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";

const quickLinks = [
  { label: "Delivery", href: "/delivery" },
  { label: "Purchase Policy", href: "/policy" },
  { label: "Return & Exchange", href: "/return" },
];

const contactLinks = [
  {
    label: "Zalo",
    href: "https://zalo.me/yourzalo",
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
  },
  {
    label: "Instagram",
    href: "https://instagram.com/yourinsta",
    icon: <Instagram className="w-5 h-5" aria-label="Instagram" />,
  },
  {
    label: "Phone",
    href: "tel:0123456789",
    icon: <Phone className="w-5 h-5" aria-label="Phone" />,
  },
  {
    label: "Email",
    href: "mailto:info@birdnestshop.com",
    icon: <Mail className="w-5 h-5" aria-label="Email" />,
  },
];

const companyInfoDescription = "Giấy chứng nhận đăng ký kinh doanh số 0109752738 do Sở Kế hoạch và Đầu tư Thành phố Hà Nội cấp ngày 23 tháng 09 năm 2021.";
const companyInfoDetails = [
  { label: "Showroom1:", value: "33 Đặng Văn Ngữ, Trung Tự, Đống Đa, Hà Nội", className: "text-[#e6b17a]" },
  { label: "Showroom2:", value: "295 Lý Thái Tổ, P. 9, Q. 10, TP. HCM", className: "text-[#e6b17a]" },
  { label: "Showroom3:", value: "29 Minh Khai, Hai Bà Trưng, Hà Nội", className: "text-[#e6b17a]" },
  { label: "Hotline:", value: "+84 393 556 866", className: "text-[#e6b17a] font-semibold" },
  { label: "Email:", value: "yanyen.vn@gmail.com", className: "text-[#e6b17a] font-semibold" },
];

const policies = [
  { label: "Chính sách quy định chung", href: "/policy/general" },
  { label: "Chính sách bảo mật", href: "/policy/privacy" },
  { label: "Chính sách bảo hành", href: "/policy/warranty" },
  { label: "Chính sách đổi trả hàng", href: "/policy/returns" },
];

const support = [
  { label: "Chính sách đặt hàng - thanh toán", href: "/support/order-payment" },
  { label: "Chính sách vận chuyển - kiểm hàng", href: "/support/shipping" },
  { label: "Câu hỏi thường gặp", href: "/support/faq" },
];

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/yensaokimsang", icon: "f" },
  { label: "Twitter", href: "https://twitter.com", icon: "🐦" },
  { label: "Behance", href: "https://behance.net", icon: "Bē" },
  { label: "Instagram", href: "https://instagram.com", icon: "📷" },
];

export default function Footer() {
  const [open, setOpen] = useState([false, false, false, false]);
  const [showFB, setShowFB] = useState(false);

  useEffect(() => {
    if ((showFB || typeof window !== "undefined" && window.innerWidth >= 768) && !document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0";
      document.body.appendChild(script);
      if (!document.getElementById("fb-root")) {
        const fbRoot = document.createElement("div");
        fbRoot.id = "fb-root";
        document.body.prepend(fbRoot);
      }
    }
  }, [showFB]);

  return (
    <footer className="w-full bg-[#9A030B] text-white px-4 py-6 mt-8">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Business Info */}
        <div>
          <h3 className="font-bold text-lg mb-3">CÔNG TY</h3>
          <div className="text-sm mb-2">{companyInfoDescription}</div>
          {companyInfoDetails.map((item, i) => (
            <div key={i} className="mb-1">
              <span className="font-semibold">{item.label}</span> <span className={item.className}>{item.value}</span>
            </div>
          ))}
        </div>
        {/* Policies */}
        <div>
          <h3 className="font-bold text-lg mb-3">CHÍNH SÁCH</h3>
          <ul className="text-sm space-y-2">
            {policies.map(link => (
              <li key={link.label}>
                <a href={link.href} className="underline hover:text-white/80 transition" aria-label={link.label}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
        {/* Customer Support */}
        <div>
          <h3 className="font-bold text-lg mb-3">HỖ TRỢ KHÁCH HÀNG</h3>
          <ul className="text-sm space-y-2">
            {support.map(link => (
              <li key={link.label}>
                <a href={link.href} className="underline hover:text-white/80 transition" aria-label={link.label}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
        {/* Contact & Social + Facebook */}
        <div>
          <h3 className="font-bold text-lg mb-3">LIÊN HỆ & MẠNG XÃ HỘI</h3>
          {/* Facebook Page Plugin */}
          <div className="mb-4">
            <div
              className="fb-page"
              data-href="https://www.facebook.com/yensaokimsang"
              data-tabs="timeline"
              data-width="320"
              data-height="130"
              data-small-header="false"
              data-adapt-container-width="true"
              data-hide-cover="false"
              data-show-facepile="true"
              style={{ maxHeight: '130px', overflow: 'hidden' }}
            ></div>
          </div>
        </div>
      </div>
      <div className="mt-6 text-center text-xs text-white/70">
        © 2025 Birdnest Shop. All rights reserved.
      </div>
    </footer>
  );
} 