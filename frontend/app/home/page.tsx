"use client";

import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, ShoppingCart, Heart, Award, Shield, Quote, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { productsApi, Product as ApiProduct } from "@/lib/api-service";
import { ProductCardList } from "@/components/ProductCardList";

interface TransformedProduct {
  id: string;
  slug: string;
  name: string;
  image: string;
  images: string[];
  price: number;
  weight: number;
  description: string;
  type: string;
  quantity: number;
  reviews: { user: string; rating: number; comment: string }[];
  sold: number;
}

const banners = [
  {
    src: "/images/banner1.png",
    alt: "Yến sào HVNEST - Premium Bird's Nest Products"
  },
  {
    src: "/images/banner2.png",
    alt: "Yến sào HVNEST - Premium Bird's Nest Products"
  },
  {
    src: "/images/banner3.png",
    alt: "Yến sào HVNEST - Premium Bird's Nest Products"
  }
];

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

const customerTestimonials = [
  {
    name: "Nguyễn Thị Mai",
    rating: 5,
    comment: "Yến sào Kim Sang chất lượng tuyệt vời, gia đình tôi rất hài lòng!",
    avatar: "/images/user.jpeg"
  },
  {
    name: "Trần Văn Hùng",
    rating: 5,
    comment: "Sản phẩm đúng như quảng cáo, giao hàng nhanh chóng.",
    avatar: "/images/user.jpeg"
  },
  {
    name: "Lê Thị Lan",
    rating: 5,
    comment: "Yến sào Kim Sang giúp tôi khỏe mạnh hơn, cảm ơn shop!",
    avatar: "/images/user.jpeg"
  }
];

export default function Home3Page() {
  const [latestProducts, setLatestProducts] = React.useState<TransformedProduct[]>([]);
  const [comboProducts, setComboProducts] = React.useState<TransformedProduct[]>([]);
  const [kimSangProducts, setKimSangProducts] = React.useState<TransformedProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch products from API
  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsApi.getProducts();
        const products = response.data?.products || response.products || [];
        
        // Transform API products to UI format
        const transformedProducts: TransformedProduct[] = products.map((product: ApiProduct) => ({
          id: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images?.[0]?.url || "/images/placeholder.png",
          images: product.images?.map(img => img.url) || ["/images/placeholder.png"],
          price: product.price,
          weight: (() => {
            if (product.name.includes("50g")) return 50;
            if (product.name.includes("100g")) return 100;
            if (product.name.includes("200g")) return 200;
            return 50;
          })(),
          description: product.description,
          type: (() => {
            if (product.name.includes("tinh chế")) return "Yến tinh chế";
            if (product.name.includes("rút lông")) return "Yến rút lông";
            if (product.name.includes("thô")) return "Tổ yến thô";
            return "Khác";
          })(),
          quantity: product.quantity || 0,
          reviews: product.reviews || [],
          sold: 0,
        }));

        // Categorize products
        const refined = transformedProducts.filter(p => p.type.includes("tinh chế")).slice(0, 4);
        const combos = transformedProducts.filter(p => p.type.includes("Combo") || p.name.includes("Combo")).slice(0, 3);
        const premium = transformedProducts.filter(p => p.name.includes("Premium") || p.name.includes("Kim Sang")).slice(0, 3);

        setLatestProducts(refined);
        setComboProducts(combos);
        setKimSangProducts(premium);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const startAutoPlay = () => {
    // Auto-play logic can be implemented here
  };

  const handleMouseEnter = () => {
    // Pause auto-play on hover
  };

  const handleMouseLeave = () => {
    // Resume auto-play on leave
  };

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
          sizes="(max-width: 1024px) 100vw, 0vw"
          style={{ zIndex: 0, objectPosition: 'center top' }}
        />
        
        {/* Desktop Layout */}
        <div className="hidden lg:block relative z-10" style={{ minHeight: '600px' }}>
          {/* Left Product Image - Desktop positioning */}
          <div className="absolute top-[40%] left-1/2 -translate-y-1/2 -translate-x-[75%] 2xl:top-[45%] 2xl:-translate-x-[110%] z-10 w-[34.2vw] max-w-[495px] min-w-[108px]">
            <Image src="/images/yen_banner_1.png" alt="Yến Sào Kim Sang Left" width={495} height={495} className="object-contain w-full h-auto drop-shadow-2xl" style={{ height: 'auto' }} />
            {/* Decor at top left of product image */}
            <div className="absolute -top-4 -left-4 z-20 w-20 md:w-32 animate-decor-slide drop-shadow-2xl">
              <Image src="/images/banner_decor_2.png" alt="Decor" width={125} height={125} className="object-contain w-full h-auto" />
            </div>
            {/* EN image at bottom left of product image */}
            <div className="absolute -bottom-16 -left-16 z-20 w-22 md:w-25 2xl:w-29 drop-shadow-2xl">
              <Image src="/images/en.png" alt="EN" width={101} height={101} className="object-contain w-full h-auto scale-x-[-1]" style={{ height: 'auto' }} />
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
                <Image src="/images/banner_decor_1.png" alt="Decor" width={96} height={96} className="object-contain w-full h-auto" style={{ height: 'auto' }} />
              </div>
            </div>
            <Link href="/products" className="inline-block bg-glossy text-red-900 font-bold px-8 py-4 rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 hover:shadow-3xl animate-button-zoom mt-6 button-glow text-sm sm:text-base" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'}}>
              ĐẶT MUA NGAY
            </Link>
          </div>
          
          {/* Decor bottom left - Desktop positioning */}
          <div className="absolute left-10 bottom-8 z-20 w-16 md:w-24 drop-shadow-2xl">
            <Image src="/images/banner_decor_1.png" alt="Decor" width={96} height={96} className="object-contain w-full h-auto" style={{ height: 'auto' }} />
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
              <Link href="/products" 
                 className="inline-block bg-glossy text-red-900 font-bold rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 hover:shadow-3xl animate-button-zoom button-glow"
                 style={{
                   fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                   padding: 'clamp(0.7em, 3vw, 1.2em) clamp(2.2em, 7vw, 3em)',
                   margin: 0,
                   marginTop: '-2vh',
                   boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
                 }}>
                ĐẶT MUA NGAY
              </Link>
            </div>
            {/* Decor below button - left and right */}
            <div className="flex justify-between items-center w-full mt-[0.5vh] px-[2vw]">
              {/* EN image - left */}
              <div className="relative" style={{width: 'clamp(57px, 19.5vw, 90px)', height: 'clamp(57px, 19.5vw, 90px)'}}>
                <Image src="/images/en.png" alt="EN" fill className="object-contain w-full h-full scale-x-[-1] drop-shadow-2xl" sizes="(max-width: 768px) 19.5vw, 90px" />
              </div>
              {/* Decor - right */}
              <div className="relative" style={{width: 'clamp(38px, 13vw, 60px)', height: 'clamp(38px, 13vw, 60px)'}}>
                <Image src="/images/banner_decor_1.png" alt="Decor" fill className="object-contain w-full h-full animate-decor-slide drop-shadow-2xl" sizes="(max-width: 768px) 13vw, 60px" />
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

      {/* Banner Carousel Section - Hidden */}
      {/* <section className="w-full bg-[#fbd8b0]">
        <Carousel className="w-full" setApi={setCarouselApi} opts={{ loop: true }}>
          <CarouselContent>
            {banners.map((banner, i) => (
              <CarouselItem key={banner.src} className="w-full">
                <div className="w-full">
                  <Image
                    src={banner.src}
                    alt={banner.alt}
                    width={1920}
                    height={600}
                    className="w-full h-auto object-cover"
                    sizes="100vw"
                    priority={i === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2" />
          <CarouselNext className="right-4 top-1/2 -translate-y-1/2" />
        </Carousel>
      </section> */}

      {/* Product Features Section */}
      <section className="w-full bg-[#fbd8b0] py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-red-700">
            Bộ sản phẩm thanh tẩy nhà cửa mang may mắn này có gì?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
              <Award className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-red-600" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-red-700">Chất Lượng Cao Cấp</h3>
              <p className="text-sm sm:text-base text-gray-600">Yến sào 100% tự nhiên, được chọn lọc kỹ lưỡng từ những tổ yến tốt nhất</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-red-600" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-red-700">An Toàn Tuyệt Đối</h3>
              <p className="text-sm sm:text-base text-gray-600">Được kiểm định chất lượng, đảm bảo vệ sinh an toàn thực phẩm</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
              <Heart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-red-600" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-red-700">Tốt Cho Sức Khỏe</h3>
              <p className="text-sm sm:text-base text-gray-600">Bổ sung dinh dưỡng, tăng cường sức đề kháng cho cả gia đình</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="w-full bg-[#fbd8b0] py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-red-700">Latest Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <ProductCardList products={latestProducts} />
          </div>
        </div>
      </section>

      {/* Premium Combos */}
      <section className="w-full bg-[#fbd8b0] py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-yellow-700">Premium Birdnest Combos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <ProductCardList products={comboProducts} />
          </div>
        </div>
      </section>

      {/* YẾN SÀO KIM SANG Products */}
      <section className="w-full bg-[#fbd8b0] py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-red-700">YẾN SÀO KIM SANG</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <ProductCardList products={kimSangProducts} />
          </div>
        </div>
      </section>

      {/* Product Highlight */}
      <section className="w-full bg-[#fbd8b0] py-6 sm:py-8 flex flex-col items-center px-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#a10000] mb-3 sm:mb-4 text-center">TỔ YẾN NGUYÊN CHẤT</h2>
        <Image src="/images/to-yen-nguyen-chat.jpg" alt="Tổ Yến Nguyên Chất" width={600} height={300} className="rounded-xl shadow-lg mx-auto w-full max-w-[600px]" style={{ height: 'auto' }} />
        <div className="mt-3 sm:mt-4 text-center text-[#a10000] font-semibold text-base sm:text-lg px-2">Tổ yến nguyên chất - Dinh dưỡng vượt trội</div>
      </section>

      {/* Customer Testimonials */}
      <section className="w-full bg-[#fbd8b0] py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-red-700">Cảm nhận khách hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {customerTestimonials.map((testimonial, index) => (
              <Card key={index} className="p-4 sm:p-6 bg-gradient-to-br from-red-50 to-orange-50">
                <CardContent className="p-0">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="rounded-full mr-3 sm:mr-4 w-10 h-10 sm:w-12 sm:h-12"
                    />
                    <div>
                      <h4 className="font-semibold text-red-700 text-sm sm:text-base">{testimonial.name}</h4>
                      <div className="flex items-center">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Quote className="w-4 h-4 sm:w-6 sm:h-6 text-red-400 mb-2" />
                  <p className="text-gray-600 italic text-sm sm:text-base">{"\""}{testimonial.comment}{"\""}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Service Section */}
      <section className="w-full bg-[#fbd8b0] py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-red-700">CUSTOMER SERVICE</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
              <Users className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-red-600" />
              <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 text-red-700">Tư Vấn 24/7</h3>
              <p className="text-xs sm:text-sm text-gray-600">Hỗ trợ tư vấn sản phẩm mọi lúc</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
              <Shield className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-red-600" />
              <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 text-red-700">Bảo Hành Chính Hãng</h3>
              <p className="text-xs sm:text-sm text-gray-600">Đảm bảo chất lượng sản phẩm</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
              <Heart className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-red-600" />
              <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 text-red-700">Giao Hàng Tận Nơi</h3>
              <p className="text-xs sm:text-sm text-gray-600">Miễn phí giao hàng toàn quốc</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
              <Award className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-red-600" />
              <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 text-red-700">Chất Lượng Đảm Bảo</h3>
              <p className="text-xs sm:text-sm text-gray-600">100% yến sào tự nhiên</p>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
} 