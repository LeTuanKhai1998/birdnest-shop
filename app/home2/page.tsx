"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useRef, useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardList } from "@/components/ProductCardList";
import { Star, Quote, Users, Award, Shield, Heart } from "lucide-react";

// Types for Prisma result
interface PrismaUser {
  name: string | null;
}

interface PrismaReview {
  user: PrismaUser;
  rating: number;
  comment: string | null;
}

interface PrismaImage {
  url: string;
  isPrimary: boolean;
}

interface PrismaCategory {
  name: string;
}

interface PrismaProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: { toString(): string };
  quantity: number;
  images: PrismaImage[];
  category: PrismaCategory;
  reviews: PrismaReview[];
}

// Type for transformed product
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

const prosperityBanners = [
  {
    src: "/images/banner1.png",
    alt: "Thịnh Vượng một cách trọn vẹn - Yến Sào Kim Sang"
  },
  {
    src: "/images/banner2.png", 
    alt: "Bộ sản phẩm thanh tẩy nhà cửa mang may mắn - Yến Sào Kim Sang"
  },
  {
    src: "/images/banner3.png",
    alt: "Yến Sào Kim Sang - Premium Bird's Nest Products"
  }
];

// Mock data for Kim Sang products
const kimSangProducts: TransformedProduct[] = [
  {
    id: "1",
    slug: "yen-sao-kim-sang-premium",
    name: "Yến Sào Kim Sang Premium",
    image: "/images/p1.png",
    images: ["/images/p1.png"],
    price: 2500000,
    weight: 100,
    description: "Yến sào cao cấp Kim Sang - Thịnh vượng trọn vẹn",
    type: "Yến tinh chế",
    quantity: 50,
    reviews: [],
    sold: 0
  },
  {
    id: "2",
    slug: "yen-sao-kim-sang-raw",
    name: "Yến Sào Kim Sang Raw",
    image: "/images/p2.png",
    images: ["/images/p2.png"],
    price: 1800000,
    weight: 100,
    description: "Yến sào thô Kim Sang - Tự nhiên nguyên chất",
    type: "Tổ yến thô",
    quantity: 30,
    reviews: [],
    sold: 0
  },
  {
    id: "3",
    slug: "yen-sao-kim-sang-combo",
    name: "Combo Yến Sào Kim Sang",
    image: "/images/p3.png",
    images: ["/images/p3.png"],
    price: 3500000,
    weight: 200,
    description: "Bộ sản phẩm Yến Sào Kim Sang - Thanh tẩy nhà cửa",
    type: "Combo",
    quantity: 20,
    reviews: [],
    sold: 0
  }
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

export default function Home2Page() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!carouselApi) return;

    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;

    // Auto-play functionality
    const startAutoPlay = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        carouselApi.scrollNext();
      }, 8000); // 8 seconds
    };

    startAutoPlay();

    // Pause on hover
    const handleMouseEnter = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleMouseLeave = () => {
      startAutoPlay();
    };

    const carouselElement = carouselApi.rootNode();
    if (carouselElement) {
      carouselElement.addEventListener('mouseenter', handleMouseEnter);
      carouselElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (carouselElement) {
        carouselElement.removeEventListener('mouseenter', handleMouseEnter);
        carouselElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [carouselApi]);

  return (
    <div className="space-y-16">
      {/* Hero Section - Thịnh Vượng một cách trọn vẹn */}
      <section className="container mx-auto px-4 flex justify-center items-center">
        <Carousel className="w-full" setApi={setCarouselApi} opts={{ loop: true }}>
          <CarouselContent>
            {prosperityBanners.map((banner, i) => (
              <CarouselItem key={banner.src} className="flex justify-center items-center">
                <Card className="w-full rounded-2xl overflow-hidden shadow-xl border-0">
                  <CardContent className="p-0 m-0 border-0">
                    <AspectRatio ratio={16 / 7}>
                      <Image
                        src={banner.src}
                        alt={banner.alt}
                        fill
                        className="object-contain object-center w-full h-full rounded-2xl"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1152px"
                        priority={i === 0}
                      />
                    </AspectRatio>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2" />
          <CarouselNext className="right-4 top-1/2 -translate-y-1/2" />
        </Carousel>
      </section>

      {/* Product Features Section */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-red-700">
          Bộ sản phẩm thanh tẩy nhà cửa mang may mắn này có gì?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
            <Award className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-xl font-semibold mb-3 text-red-700">Chất Lượng Cao Cấp</h3>
            <p className="text-gray-600">Yến sào 100% tự nhiên, được chọn lọc kỹ lưỡng từ những tổ yến tốt nhất</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
            <Shield className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-xl font-semibold mb-3 text-red-700">An Toàn Tuyệt Đối</h3>
            <p className="text-gray-600">Được kiểm định chất lượng, đảm bảo vệ sinh an toàn thực phẩm</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
            <Heart className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-xl font-semibold mb-3 text-red-700">Tốt Cho Sức Khỏe</h3>
            <p className="text-gray-600">Bổ sung dinh dưỡng, tăng cường sức đề kháng cho cả gia đình</p>
          </div>
        </div>
      </section>

      {/* YẾN SÀO KIM SANG Products */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-red-700">YẾN SÀO KIM SANG</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProductCardList products={kimSangProducts} />
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-red-700">Cảm nhận khách hàng</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {customerTestimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-gradient-to-br from-red-50 to-orange-50">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={50}
                    height={50}
                    className="rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-red-700">{testimonial.name}</h4>
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <Quote className="w-6 h-6 text-red-400 mb-2" />
                <p className="text-gray-600 italic">"{testimonial.comment}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Customer Service Section */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-red-700">CUSTOMER SERVICE</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
            <Users className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-semibold mb-2 text-red-700">Tư Vấn 24/7</h3>
            <p className="text-gray-600">Hỗ trợ tư vấn sản phẩm mọi lúc</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
            <Shield className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-semibold mb-2 text-red-700">Bảo Hành Chính Hãng</h3>
            <p className="text-gray-600">Đảm bảo chất lượng sản phẩm</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
            <Heart className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-semibold mb-2 text-red-700">Giao Hàng Tận Nơi</h3>
            <p className="text-gray-600">Miễn phí giao hàng toàn quốc</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
            <Award className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-semibold mb-2 text-red-700">Chất Lượng Đảm Bảo</h3>
            <p className="text-gray-600">100% yến sào tự nhiên</p>
          </div>
        </div>
      </section>

      {/* Copyright Section */}
      <section className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500 text-sm">
          ©2024 Allrights reserved yensaokimsang
        </p>
      </section>
    </div>
  );
} 