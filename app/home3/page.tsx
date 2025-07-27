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
          <div className="w-full min-h-screen bg-[#fbd8b0] flex flex-col">
      {/* Hero Banner - Desktop & Mobile Optimized */}
      <section className="relative w-full bg-[#a10000] overflow-hidden lg:bg-[#a10000] bg-gradient-to-b from-[#a10000] to-[#fbd8b0]" style={{ minHeight: '600px' }}>
        {/* Background Image - Desktop */}
        <Image
          src="/images/bg_banner_top.jpg"
          alt="Banner Background"
          fill
          className="object-cover w-full h-full hidden lg:block"
          priority
          quality={100}
          sizes="100vw"
          style={{ zIndex: 0, objectPosition: 'center 30%' }}
        />
        
        {/* Background Image - Mobile */}
        <Image
          src="/images/bg_banner_top_mobile.jpg"
          alt="Banner Background Mobile"
          fill
          className="object-contain sm:object-cover md:object-cover w-full h-full lg:hidden"
          priority
          quality={100}
          sizes="100vw"
          style={{ zIndex: 0, objectPosition: 'center top' }}
        />
        
        {/* Desktop Layout */}
        <div className="hidden lg:block relative z-10" style={{ minHeight: '600px' }}>
          {/* Left Product Image - Desktop positioning */}
          <div className="absolute top-[40%] left-1/2 -translate-y-1/2 -translate-x-[75%] 2xl:top-[45%] 2xl:-translate-x-[110%] z-10 w-[34.2vw] max-w-[495px] min-w-[108px]">
            <Image src="/images/yen_banner_1.png" alt="Yến Sào Kim Sang Left" width={495} height={495} className="object-contain w-full h-auto drop-shadow-2xl" />
            {/* Decor at top left of product image */}
            <div className="absolute -top-4 -left-4 z-20 w-20 md:w-32 animate-decor-slide drop-shadow-2xl">
              <Image src="/images/banner_decor_2.png" alt="Decor" width={125} height={125} className="object-contain w-full h-auto" />
            </div>
            {/* EN image at bottom left of product image */}
            <div className="absolute -bottom-16 -left-16 z-20 w-22 md:w-25 2xl:w-29 drop-shadow-2xl">
              <Image src="/images/en.png" alt="EN" width={101} height={101} className="object-contain w-full h-auto scale-x-[-1]" />
            </div>
          </div>
          
          {/* Main Content - Desktop positioning */}
          <div className="absolute top-[40%] left-1/2 -translate-y-1/2 translate-x-[20%] 2xl:top-[45%] z-20 flex flex-col items-center justify-center w-[411px] max-w-full py-12 md:py-20 text-white text-center px-4 bg-transparent">
            <h1 className="text-glossy text-3xl md:text-5xl font-black italic" style={{fontWeight: 900, fontStyle: 'italic', fontFamily: 'Inter, sans-serif', fontSize: '3.3rem', padding: '20px'}}>
              <span style={{whiteSpace: 'nowrap'}}>TỔ YẾN SÀO</span><br />
              <span style={{whiteSpace: 'nowrap'}}>NGUYÊN CHẤT</span>
            </h1>
            <p className="text-lg md:text-xl mb-4 font-medium italic" style={{fontFamily:'Inter, sans-serif', fontWeight:500, color:'#fff'}}>
              Cho sức khỏe gia đình bạn
            </p>
            <div className="relative inline-block px-0 py-0 mb-3 drop-shadow-2xl" style={{borderRadius: '16px'}}>
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '16px',
                padding: '2px',
                background: '#F0B000',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                pointerEvents: 'none',
                zIndex: 1
              }} />
              <div className="relative z-10 flex flex-col items-center justify-center bg-[#a10000] rounded-[16px] px-6 py-3 border-2 border-[#F0B000]" style={{minWidth: '260px'}}>
                <div className="font-bold text-white text-lg md:text-2xl" style={{lineHeight: 1.2}}>
                  Giao hàng <span className="text-yellow-300">MIỄN PHÍ</span>
                </div>
                <div className="text-white text-sm md:text-base mt-1">Đơn hàng từ 1.000.000đ trở lên</div>
              </div>
              {/* Decor to the right of shipping info */}
              <div className="absolute -top-4 -right-45 z-20 w-16 md:w-24 animate-decor-slide drop-shadow-2xl">
                <Image src="/images/banner_decor_1.png" alt="Decor" width={96} height={96} className="object-contain w-full h-auto" />
              </div>
            </div>
            <a href="/products" className="inline-block bg-glossy text-red-900 font-bold px-8 py-4 rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 hover:shadow-3xl animate-button-zoom mt-6 button-glow text-sm sm:text-base" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'}}>
              ĐẶT MUA NGAY
            </a>
          </div>
          
          {/* Decor bottom left - Desktop positioning */}
          <div className="absolute left-10 bottom-8 z-20 w-16 md:w-24 drop-shadow-2xl">
            <Image src="/images/banner_decor_1.png" alt="Decor" width={96} height={96} className="object-contain w-full h-auto" />
          </div>
        </div>
        
        {/* Mobile Layout (Fluid Responsive) */}
        <div className="lg:hidden relative z-10 flex flex-col items-center justify-start px-[2vw] pt-[3vh] pb-[2vh]" style={{ minHeight: 'calc(100vh - 80px)', alignItems: 'center' }}>
          {/* Product Image Section - Mobile Only - Centered and Larger */}
          <div className="relative w-full max-w-[90vw] mb-[4vh]" style={{height: 'clamp(180px, 38vw, 320px)'}}>
            <Image 
              src="/images/yen_banner_1.png" 
              alt="Yến Sào Kim Sang" 
              fill
              className="object-contain w-full h-full drop-shadow-2xl" 
              sizes="90vw"
              priority
            />
            {/* Decor at top left of product image */}
            <div className="absolute -top-[3vw] left-[2vw] z-20 w-[15.6vw] min-w-[48px] max-w-[84px] animate-decor-slide drop-shadow-2xl">
              <Image src="/images/banner_decor_2.png" alt="Decor" width={72} height={72} className="object-contain w-full h-auto" />
            </div>
          </div>
          {/* Content Section - Mobile Only - Centered */}
          <div className="flex flex-col items-center text-white text-center w-full max-w-[96vw] px-[1vw] mt-[4vh]">
            <h1 className="text-glossy font-black italic" 
                style={{
                  fontWeight: 900, 
                  fontStyle: 'italic', 
                  fontFamily: 'Inter, sans-serif', 
                  fontSize: 'clamp(2.2rem, 8.5vw, 3.2rem)',
                  lineHeight: 1.1,
                  padding: 'clamp(0.3em, 2vw, 0.7em) 0',
                  marginBottom: 'clamp(0.2em, 1.5vw, 0.5em)'
                }}>
              <span className="block">TỔ YẾN SÀO</span>
              <span className="block">NGUYÊN CHẤT</span>
            </h1>
            <p className="font-medium italic" 
               style={{
                 fontFamily:'Inter, sans-serif', 
                 fontWeight:500, 
                 color:'#fff',
                 fontSize: 'clamp(1.2rem, 4.5vw, 1.6rem)',
                 marginBottom: 'clamp(0.5em, 2vw, 1em)'
               }}>
              Cho sức khỏe gia đình bạn
            </p>
            {/* Shipping Info Box */}
            <div className="relative mb-[2vh] drop-shadow-2xl w-full flex justify-center">
              <div className="relative bg-[#a10000] rounded-[1.2em] px-[3vw] py-[2vw] border-2 border-[#F0B000] min-w-[65vw] max-w-[95vw]" style={{boxSizing:'border-box'}}>
                <div className="font-bold text-white" style={{lineHeight: 1.2, fontSize: 'clamp(1.1rem, 4.2vw, 1.4rem)'}}>
                  Giao hàng <span className="text-yellow-300">MIỄN PHÍ</span>
                </div>
                <div className="text-white" style={{fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)', marginTop: '0.3em'}}>
                  Đơn hàng từ 1.000.000đ trở lên
                </div>
              </div>
            </div>
            {/* CTA Button and Decor Row */}
            <div className="flex flex-row items-center justify-center w-full max-w-[96vw] mt-[6vh] gap-[1.5vw] relative">
              {/* Button - center */}
              <a href="/products" 
                 className="inline-block bg-glossy text-red-900 font-bold rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 hover:shadow-3xl animate-button-zoom button-glow"
                 style={{
                   fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                   padding: 'clamp(0.7em, 3vw, 1.2em) clamp(2.2em, 7vw, 3em)',
                   margin: 0,
                   marginTop: '-2vh',
                   boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
                 }}>
                ĐẶT MUA NGAY
              </a>
            </div>
            {/* Decor below button - left and right */}
            <div className="flex justify-between items-center w-full mt-[0.5vh] px-[2vw]">
              {/* EN image - left */}
              <div className="relative" style={{width: 'clamp(57px, 19.5vw, 90px)', height: 'clamp(57px, 19.5vw, 90px)'}}>
                <Image src="/images/en.png" alt="EN" fill className="object-contain w-full h-full scale-x-[-1] drop-shadow-2xl" />
              </div>
              {/* Decor - right */}
              <div className="relative" style={{width: 'clamp(38px, 13vw, 60px)', height: 'clamp(38px, 13vw, 60px)'}}>
                <Image src="/images/banner_decor_1.png" alt="Decor" fill className="object-contain w-full h-full animate-decor-slide drop-shadow-2xl" />
              </div>
            </div>
          </div>
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

          @keyframes shine {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }

          .text-glossy {
            background: linear-gradient(90deg, #FFDA41, #FFF9DD, #FFDA41);
            background-size: 200% 100%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: shine 2.5s linear infinite;
          }

          .bg-glossy {
            background: linear-gradient(90deg, #FFDA41, #FFF9DD, #FFDA41);
            background-size: 200% 100%;
            animation: shine 2.5s linear infinite;
          }

          .animate-pulse-slow {
            animation: pulse-slow 2s ease-in-out infinite;
          }

          @keyframes pulse-slow {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.02);
            }
          }

          .animate-button-zoom {
            animation: button-zoom 1.2s ease-in-out infinite;
          }

          @keyframes button-zoom {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.12);
            }
          }

          .button-glow {
            position: relative;
            overflow: hidden;
          }

          .button-glow::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            transition: left 0.5s;
          }

          .button-glow:hover::before {
            left: 100%;
          }

          .hover\:shadow-3xl:hover {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
          }

          /* Mobile touch optimizations */
          @media (max-width: 640px) {
            .button-glow {
              touch-action: manipulation;
              -webkit-tap-highlight-color: transparent;
            }
            
            .animate-button-zoom {
              animation: button-zoom 1.5s ease-in-out infinite;
            }
            
            .animate-decor-slide {
              animation: decor-slide 4s ease-in-out infinite;
            }
          }

          /* Ensure smooth scrolling on mobile */
          html {
            scroll-behavior: smooth;
          }

          /* Optimize for mobile performance */
          @media (max-width: 640px) {
            * {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
          }
        `}</style>
      </section>

      {/* Feature Icons Row */}
      <section className="w-full bg-[#fbd8b0] py-4 sm:py-6 flex flex-col items-center">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 px-4">
          {featureIcons.map((f, i) => (
            <div key={i} className="flex flex-col items-center min-w-[100px] sm:min-w-0">
              <Image src={f.icon} alt={f.label} width={48} height={48} className="mb-2 w-8 h-8 sm:w-12 sm:h-12" />
              <span className="text-sm sm:text-base font-semibold text-[#a10000] text-center max-w-[100px] sm:max-w-[120px] leading-tight">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Product Highlight */}
      <section className="w-full bg-[#fbd8b0] py-6 sm:py-8 flex flex-col items-center px-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#a10000] mb-3 sm:mb-4 text-center">TỔ YẾN NGUYÊN CHẤT</h2>
        <Image src="/images/to-yen-nguyen-chat.jpg" alt="Tổ Yến Nguyên Chất" width={600} height={300} className="rounded-xl shadow-lg mx-auto w-full max-w-[600px]" />
        <div className="mt-3 sm:mt-4 text-center text-[#a10000] font-semibold text-base sm:text-lg px-2">Tổ yến nguyên chất - Dinh dưỡng vượt trội</div>
      </section>

      {/* Testimonial/Slider Section */}
      <section className="w-full bg-[#fbd8b0] py-6 sm:py-8 flex flex-col items-center px-4">
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#a10000] mb-3 sm:mb-4 text-center">Thịnh Vượng một cách trọn vẹn</h3>
        <div className="relative w-full max-w-xl mx-auto">
          <div className="bg-[#fbd8b0] rounded-xl shadow p-4 sm:p-6 flex flex-col md:flex-row items-center gap-3 sm:gap-4">
            <Image src="/images/p1.png" alt="Testimonial" width={120} height={120} className="rounded-xl object-cover w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
            <div className="flex-1 text-[#a10000] text-sm sm:text-base md:text-lg font-medium text-center md:text-left">Sản phẩm yến sào Kim Sang mang lại may mắn và sức khỏe cho gia đình bạn!</div>
          </div>
        </div>
      </section>

      {/* Product Details/Box Section */}
      <section className="relative w-full bg-[#a10000] py-8 sm:py-12 px-4 sm:px-2 text-white">
        <Image src="/images/bg_banner_bottom.jpg" alt="Decor" fill className="object-cover object-center w-full h-full absolute left-0 top-0 opacity-40" style={{zIndex:0}} />
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          <Image src="/images/p3.png" alt="Product Box" width={260} height={260} className="rounded-xl shadow-lg w-48 h-48 sm:w-64 sm:h-64 md:w-auto md:h-auto" />
          <div className="text-center md:text-left">
            <h4 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">Bộ sản phẩm thanh tẩy nhà cửa mang may mắn này có gì?</h4>
            <ul className="list-disc pl-6 space-y-1 sm:space-y-2 text-sm sm:text-base md:text-lg">
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
      <section className="w-full bg-[#a10000] py-8 sm:py-12 flex flex-col items-center px-4">
        <h4 className="text-base sm:text-lg md:text-xl font-bold text-yellow-300 mb-4 sm:mb-6 text-center">Cảm nhận khách hàng</h4>
        <div className="relative w-full max-w-3xl mx-auto flex items-center justify-center">
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-yellow-300 text-[#a10000] rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow hover:bg-yellow-400 transition text-sm sm:text-base"
            onClick={() => setChatIdx((prev) => (prev === 0 ? chatScreenshots.length - 1 : prev - 1))}
            aria-label="Previous feedback"
          >&lt;</button>
          <div className="flex-1 flex justify-center">
            <Image
              src={chatScreenshots[chatIdx]}
              alt={`Feedback ${chatIdx + 1}`}
              width={220}
              height={400}
              className="rounded-lg shadow-lg object-cover h-[180px] sm:h-[220px] w-auto"
            />
          </div>
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-yellow-300 text-[#a10000] rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow hover:bg-yellow-400 transition text-sm sm:text-base"
            onClick={() => setChatIdx((prev) => (prev === chatScreenshots.length - 1 ? 0 : prev + 1))}
            aria-label="Next feedback"
          >&gt;</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#a10000] text-white py-6 sm:py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center md:text-left">
            <h5 className="font-bold mb-2 text-sm sm:text-base">YẾN SÀO KIM SANG</h5>
            <p className="text-xs sm:text-sm">Address: 45 Trần Hưng Đạo, Đảo, Rạch Giá, Kiên Giang</p>
            <p className="text-xs sm:text-sm">Hotline: 0939 556 866</p>
            <p className="text-xs sm:text-sm">Email: minhtuyen.kg@gmail.com</p>
            <p className="text-xs sm:text-sm">Website: https://yenkimsang.com</p>
          </div>
          <div className="text-center md:text-left">
            <h5 className="font-bold mb-2 text-sm sm:text-base">CUSTOMER SERVICE</h5>
            <ul className="text-xs sm:text-sm space-y-1">
              <li>Return &amp; Shipping Policy</li>
              <li>Return of Use</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Image src="/images/logo.png" alt="Logo" width={80} height={80} className="rounded-full bg-white/80 p-2 shadow-lg mb-2 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
            <p className="text-xs text-white/70 text-center">©2024 yensaokimsang. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 