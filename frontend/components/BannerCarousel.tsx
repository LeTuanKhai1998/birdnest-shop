"use client";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect } from "react";

const banners = [
  { src: "/images/banner1.png", alt: "Premium Birdnest Banner 1" },
  { src: "/images/banner2.png", alt: "Gift Combo Banner 2" },
  { src: "/images/banner3.png", alt: "Promotion Banner 3" },
];

export default function BannerCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 600 });

  // Auto play
  useEffect(() => {
    if (!emblaApi) return;
    let raf: number;
    let lastTime = Date.now();
    const autoPlay = () => {
      if (Date.now() - lastTime > 8000) {
        emblaApi.scrollNext();
        lastTime = Date.now();
      }
      raf = requestAnimationFrame(autoPlay);
    };
    raf = requestAnimationFrame(autoPlay);
    return () => cancelAnimationFrame(raf);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <div className="w-screen flex justify-center items-center m-0 p-0">
      <Card className="w-screen max-w-6xl rounded-2xl overflow-hidden shadow-xl border-0 m-0 p-0">
        <CardContent className="p-0 m-0 border-0">
          <div className="relative w-full">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex">
                {banners.map((banner, i) => (
                  <div className="min-w-0 flex-[0_0_100%]" key={banner.src}>
                    <AspectRatio ratio={16 / 9}>
                      <Image
                        src={banner.src}
                        alt={banner.alt}
                        fill
                        className="object-cover object-center w-full h-full rounded-2xl"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1152px"
                        priority={i === 0}
                      />
                    </AspectRatio>
                  </div>
                ))}
              </div>
            </div>
            {/* Carousel Controls */}
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <Button size="icon" variant="secondary" onClick={scrollPrev} aria-label="Previous banner" className="bg-white/80 hover:bg-white">
                &#8592;
              </Button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <Button size="icon" variant="secondary" onClick={scrollNext} aria-label="Next banner" className="bg-white/80 hover:bg-white">
                &#8594;
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 