"use client";
import { useState, useRef, useEffect, type RefObject } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function ProductImageGallery({ images, productName }: { images: string[]; productName: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, skipSnaps: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi && emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (thumbRefs.current[selectedIndex]) {
      thumbRefs.current[selectedIndex]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <div className="w-full flex flex-col items-center relative">
      {/* Main Embla Carousel */}
      <div className="w-full max-w-[600px] aspect-[4/3] relative overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((img, idx) => (
            <div
              key={img}
              className="flex-shrink-0 flex-grow-0 basis-full flex items-center justify-center h-full"
              style={{ minWidth: '100%' }}
            >
              <div className="relative w-full h-[300px] md:h-[450px]">
                <Image
                  src={img}
                  alt={productName + ' image'}
                  fill
                  className="object-contain w-full h-full rounded-xl shadow transition-all duration-500"
                  priority={idx === 0}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-8 overflow-x-auto w-full justify-center md:justify-start h-[110px] md:h-[130px] pt-2 md:pt-3">
          {images.map((img, idx) => (
            <button
              key={img}
              onClick={() => emblaApi && emblaApi.scrollTo(idx)}
              ref={el => { thumbRefs.current[idx] = el; }}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-lg transition-all duration-150 overflow-hidden focus:outline-none focus:ring-2 focus:ring-red-400 border-2 md:border-2 p-0.5 md:p-1 ${idx === 0 ? 'ml-2 md:ml-4' : ''} ${selectedIndex === idx ? 'border-red-600 shadow-lg ring-1 ring-red-400' : 'border-gray-200'}`}
              aria-label={`Xem ảnh ${idx + 1}`}
              tabIndex={0}
              type="button"
            >
              <div className="relative w-full h-full">
                <Image src={img} alt={productName + ' thumbnail'} fill className="object-cover w-full h-full" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 