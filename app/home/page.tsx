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
import { products } from "@/lib/products-data";

const banners = [
  { src: "/images/banner1.png", alt: "Premium Birdnest Banner 1" },
  { src: "/images/banner2.png", alt: "Gift Combo Banner 2" },
  { src: "/images/banner3.png", alt: "Promotion Banner 3" },
];

export default function HomePage() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      setCurrent(carouselApi.selectedScrollSnap());
    };
    carouselApi.on("select", onSelect);
    onSelect();
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (current === banners.length - 1) {
        carouselApi.scrollTo(0);
      } else {
        carouselApi.scrollNext();
      }
    }, 8000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [carouselApi, current]);

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
                        sizes="100vw"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
          {products.filter(p => p.type !== "Combo").slice(0, 3).map((product, i) => (
            <ProductCard key={i} product={product} />
          ))}
        </div>
      </section>

      {/* Premium Combos */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-yellow-700">Premium Birdnest Combos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
          {products.filter(p => p.type === "Combo").map((combo, i) => (
            <ProductCard key={i} product={combo} />
          ))}
        </div>
      </section>
    </div>
  );
} 