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

const banners = [
  {
    src: "/images/banner1.png",
    alt: "Yến sào HVNEST - Premium Bird's Nest Products"
  },
  {
    src: "/images/banner2.png", 
    alt: "Yến chưng hũ HVNEST - Jarred Bird's Nest Products"
  },
  {
    src: "/images/banner3.png",
    alt: "Yến sào HVNEST - Premium Bird's Nest Products"
  }
];

// Mock data for now - you can replace with actual API calls later
const mockLatestProducts: TransformedProduct[] = [
  {
    id: "1",
    slug: "premium-birds-nest",
    name: "Premium Bird's Nest",
    image: "/images/p1.png",
    images: ["/images/p1.png"],
    price: 1500000,
    weight: 100,
    description: "High-quality bird's nest",
    type: "Refined Nest",
    quantity: 50,
    reviews: [],
    sold: 0
  },
  {
    id: "2",
    slug: "raw-birds-nest",
    name: "Raw Bird's Nest",
    image: "/images/p2.png",
    images: ["/images/p2.png"],
    price: 1200000,
    weight: 100,
    description: "Natural raw bird's nest",
    type: "Raw Nest",
    quantity: 30,
    reviews: [],
    sold: 0
  }
];

const mockComboProducts: TransformedProduct[] = [
  {
    id: "3",
    slug: "premium-combo",
    name: "Premium Combo Set",
    image: "/images/p3.png",
    images: ["/images/p3.png"],
    price: 2500000,
    weight: 200,
    description: "Premium bird's nest combo",
    type: "Combo",
    quantity: 20,
    reviews: [],
    sold: 0
  }
];

export default function HomePage() {
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
    <div className="space-y-12">
      {/* Banner Carousel */}
      <section className="container mx-auto px-4 flex justify-center items-center">
        <Carousel className="w-full" setApi={setCarouselApi} opts={{ loop: true }}>
          <CarouselContent>
            {banners.map((banner, i) => (
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

      {/* Latest Products */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-red-700">Latest Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-2 gap-y-4">
          <ProductCardList products={mockLatestProducts} />
        </div>
      </section>

      {/* Premium Combos */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-yellow-700">Premium Birdnest Combos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-2 gap-y-4">
          <ProductCardList products={mockComboProducts} />
        </div>
      </section>
    </div>
  );
} 