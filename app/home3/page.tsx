"use client";

import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";

const featureIcons = [
  {
    icon: "/images/banner_decor_1.png",
    label: "Chất Lượng Thượng Hạng",
  },
  {
    icon: "/images/body_decor_1.png",
    label: "Tận Tâm Khách Hàng",
  },
  {
    icon: "/images/logo.png",
    label: "Thương Hiệu Uy Tín",
  },
];

const chatScreenshots = [
  "/images/p1.png",
  "/images/p2.png",
  "/images/p3.png",
];

export default function Home3Page() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [chatIdx, setChatIdx] = useState(0);

  return (
    <div className="w-full min-h-screen bg-[#fff6e3] flex flex-col">
      {/* Hero Banner */}
      <section
        className="relative w-full"
        style={{ aspectRatio: "1920/638", minHeight: 200 }}
      >
        <Image
          src="/images/bg_banner_top.jpg"
          alt="Banner Background"
          fill
          className="object-contain w-full h-full"
          priority
          style={{ zIndex: 0 }}
        />
        {/* Left Product Image - Centered left of content, moved up */}
        <div className="absolute top-[35%] left-1/2 -translate-y-1/2 -translate-x-[80%] md:-translate-x-[100%] z-10 w-[38vw] max-w-[550px] min-w-[120px]">
          <Image src="/images/yen_banner_.png" alt="Yến Sào Kim Sang Left" width={550} height={550} className="object-contain w-full h-auto" />
          {/* Decor above and to the left of product image */}
          <div className="absolute -top-8 -left-6 z-20 w-20 md:w-32 animate-decor-slide">
            <Image src="/images/banner_decor_2.png" alt="Decor" width={125} height={125} className="object-contain w-full h-auto" />
          </div>
        </div>
        {/* Right Product Image - Centered right of content */}
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 translate-x-[120%] md:translate-x-[140%] z-10 w-[32vw] max-w-[340px] min-w-[100px]">
        </div>
        {/* Decor bottom left */}
        <div className="absolute left-2 md:left-10 bottom-2 md:bottom-8 z-20 w-16 md:w-24">
          <Image src="/images/banner_decor_1.png" alt="Decor" width={96} height={96} className="object-contain w-full h-auto" />
        </div>
        {/* Main Content - moved up */}
        <div className="absolute top-[35%] left-1/2 -translate-y-1/2 translate-x-[10%] md:translate-x-[30%] z-30 flex flex-col items-center justify-center w-[411px] max-w-full py-12 md:py-20 text-white text-center px-4 bg-transparent">
          <Image src="/images/logo.png" alt="Logo" width={109} height={109} className="mx-auto mb-4 rounded-full bg-white/80 p-2 shadow-lg" />
          <h1 className="text-3xl md:text-5xl font-black mb-2 drop-shadow-lg italic" style={{textShadow:'0 2px 8px #a10000', color: '#FBDF58', fontWeight: 900}}>
            TỔ YẾN SÀO<br />
            NGUYÊN CHẤT
          </h1>
          <p className="text-lg md:text-xl mb-4 font-medium drop-shadow" style={{fontFamily:'Dancing Script, cursive', fontWeight:500}}>Cho sức khỏe gia đình bạn</p>
          <div className="inline-block bg-white/10 border border-yellow-400 rounded-full px-6 py-2 mb-3">
            <span className="font-bold text-white">Giao hàng <span className="text-yellow-300">MIỄN PHÍ</span></span>
            <span className="ml-2 text-yellow-200">Đơn hàng từ 1.000.000đ trở lên</span>
          </div>
          <a href="#buy" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-red-900 font-bold px-6 py-3 rounded-full shadow transition mt-2">ĐẶT MUA NGAY</a>
        </div>
        
        {/* Animation keyframes */}
        <style jsx global>{`
          @keyframes decor-slide {
            0% { transform: translateX(-20px); }
            50% { transform: translateX(20px); }
            100% { transform: translateX(-20px); }
          }
          .animate-decor-slide {
            animation: decor-slide 3s ease-in-out infinite;
          }
        `}</style>
      </section>

      {/* Feature Icons Row */}
      <section className="w-full bg-[#fff6e3] py-6 flex flex-col items-center">
        <div className="flex flex-wrap justify-center gap-8">
          {featureIcons.map((f, i) => (
            <div key={i} className="flex flex-col items-center">
              <Image src={f.icon} alt={f.label} width={48} height={48} className="mb-2" />
              <span className="text-base font-semibold text-[#a10000] text-center max-w-[120px]">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Product Highlight */}
      <section className="w-full bg-[#fff6e3] py-8 flex flex-col items-center">
        <h2 className="text-xl md:text-2xl font-bold text-[#a10000] mb-4">TỔ YẾN NGUYÊN CHẤT</h2>
        <Image src="/images/to-yen-nguyen-chat.jpg" alt="Tổ Yến Nguyên Chất" width={600} height={300} className="rounded-xl shadow-lg mx-auto" />
        <div className="mt-4 text-center text-[#a10000] font-semibold text-lg">Tổ yến nguyên chất - Dinh dưỡng vượt trội</div>
      </section>

      {/* Testimonial/Slider Section */}
      <section className="w-full bg-[#fff6e3] py-8 flex flex-col items-center">
        <h3 className="text-lg md:text-xl font-bold text-[#a10000] mb-4">Thịnh Vượng một cách trọn vẹn</h3>
        <div className="relative w-full max-w-xl mx-auto">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row items-center gap-4">
            <Image src="/images/p1.png" alt="Testimonial" width={120} height={120} className="rounded-xl object-cover" />
            <div className="flex-1 text-[#a10000] text-base md:text-lg font-medium">Sản phẩm yến sào Kim Sang mang lại may mắn và sức khỏe cho gia đình bạn!</div>
          </div>
        </div>
      </section>

      {/* Product Details/Box Section */}
      <section className="relative w-full bg-[#a10000] py-12 px-2 text-white">
        <Image src="/images/bg_banner_bottom.jpg" alt="Decor" fill className="object-cover object-center w-full h-full absolute left-0 top-0 opacity-40" style={{zIndex:0}} />
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <Image src="/images/p3.png" alt="Product Box" width={260} height={260} className="rounded-xl shadow-lg" />
          <div>
            <h4 className="text-xl md:text-2xl font-bold mb-4">Bộ sản phẩm thanh tẩy nhà cửa mang may mắn này có gì?</h4>
            <ul className="list-disc pl-6 space-y-2 text-base md:text-lg">
              <li>1 hộp tổ yến nguyên chất 4 inch</li>
              <li>100% yến tươi, tinh chế</li>
              <li>1 hộp thảo mộc xông nhà</li>
              <li>1 gói thảo mộc xông nhà Loresence</li>
              <li>Hộp đựng sang trọng, thích hợp làm quà tặng</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Customer Feedback Section */}
      <section className="w-full bg-[#a10000] py-12 flex flex-col items-center">
        <h4 className="text-lg md:text-xl font-bold text-yellow-300 mb-6">Cảm nhận khách hàng</h4>
        <div className="relative w-full max-w-3xl mx-auto flex items-center justify-center">
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-yellow-300 text-[#a10000] rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-yellow-400 transition"
            onClick={() => setChatIdx((prev) => (prev === 0 ? chatScreenshots.length - 1 : prev - 1))}
            aria-label="Previous feedback"
          >&lt;</button>
          <div className="flex-1 flex justify-center">
            <Image
              src={chatScreenshots[chatIdx]}
              alt={`Feedback ${chatIdx + 1}`}
              width={220}
              height={400}
              className="rounded-lg shadow-lg object-cover h-[220px] w-auto"
            />
          </div>
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-yellow-300 text-[#a10000] rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-yellow-400 transition"
            onClick={() => setChatIdx((prev) => (prev === chatScreenshots.length - 1 ? 0 : prev + 1))}
            aria-label="Next feedback"
          >&gt;</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#a10000] text-white py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h5 className="font-bold mb-2">YẾN SÀO KIM SANG</h5>
            <p className="text-sm">Address: 45 Trần Hưng Đạo, Đảo, Rạch Giá, Kiên Giang</p>
            <p className="text-sm">Hotline: 0939 556 866</p>
            <p className="text-sm">Email: minhtuyen.kg@gmail.com</p>
            <p className="text-sm">Website: https://yenkimsang.com</p>
          </div>
          <div>
            <h5 className="font-bold mb-2">CUSTOMER SERVICE</h5>
            <ul className="text-sm space-y-1">
              <li>Return &amp; Shipping Policy</li>
              <li>Return of Use</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Image src="/images/logo.png" alt="Logo" width={80} height={80} className="rounded-full bg-white/80 p-2 shadow-lg mb-2" />
            <p className="text-xs text-white/70">©2024 yensaokimsang. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 