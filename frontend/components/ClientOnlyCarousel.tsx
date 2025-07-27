"use client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";

const banners = [
  { src: "/images/banner1.png", alt: "Premium Birdnest Banner 1" },
  { src: "/images/banner2.png", alt: "Gift Combo Banner 2" },
  { src: "/images/banner3.png", alt: "Promotion Banner 3" },
];

export default function ClientOnlyCarousel() {
  return (
    <section className="w-screen flex justify-center items-center">
      <Carousel className="w-screen h-[500px] md:h-[600px]">
        <CarouselContent className="h-full">
          {banners.map((banner, i) => (
            <CarouselItem key={banner.src} className="flex justify-center items-center h-full">
              <div className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center">
                <Image
                  src={banner.src}
                  alt={banner.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1152px"
                  className="object-contain object-center w-full h-full"
                  priority={i === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2" />
        <CarouselNext className="right-4 top-1/2 -translate-y-1/2" />
      </Carousel>
    </section>
  );
} 