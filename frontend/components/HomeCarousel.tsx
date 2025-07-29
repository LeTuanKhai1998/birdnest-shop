'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useRef, useEffect, useState } from 'react';

interface Banner {
  src: string;
  alt: string;
}

interface HomeCarouselProps {
  banners: Banner[];
}

export function HomeCarousel({ banners }: HomeCarouselProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      setCurrent(carouselApi.selectedScrollSnap());
    };
    carouselApi.on('select', onSelect);
    onSelect();
    return () => {
      carouselApi.off('select', onSelect);
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
  }, [carouselApi, current, banners.length]);

  return (
    <section className="container mx-auto px-4 flex justify-center items-center">
      <Carousel
        className="w-full"
        setApi={setCarouselApi}
        opts={{ loop: true }}
      >
        <CarouselContent>
          {banners.map((banner, i) => (
            <CarouselItem
              key={banner.src}
              className="flex justify-center items-center"
            >
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
  );
}
