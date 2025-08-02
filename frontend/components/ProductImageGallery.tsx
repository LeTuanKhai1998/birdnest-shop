'use client';
import { useState, useRef, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { SmartImage } from '@/components/ui/SmartImage';
import { Card, CardContent } from '@/components/ui/card';
import { ZoomIn } from 'lucide-react';
import ImageZoomPopup from './ImageZoomPopup';

export default function ProductImageGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    skipSnaps: false,
    dragFree: false,
    containScroll: 'trimSnaps',
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => {
      if (emblaApi) {
        emblaApi.off('select', onSelect);
      }
    };
  }, [emblaApi]);

  useEffect(() => {
    if (thumbRefs.current[selectedIndex]) {
      thumbRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);



  return (
    <div className="w-full flex flex-col items-center relative">
      {/* Main Embla Carousel with white card background */}
      <Card className="w-full max-w-[600px] aspect-[1/1] bg-white shadow-lg border-0 overflow-hidden">
        <CardContent className="p-0 h-full">
          <div
            className="w-full h-full relative overflow-hidden"
            ref={emblaRef}
          >
            <div className="flex h-full">
              {images.map((img, idx) => (
                <div
                  key={img}
                  className="flex-shrink-0 flex-grow-0 basis-full flex items-center justify-center h-full bg-white"
                  style={{ minWidth: '100%' }}
                >
                  <div 
                    className="relative w-full h-full flex items-center justify-center group cursor-pointer"
                    onClick={() => {
                      setIsZoomOpen(true);
                    }}
                  >
                    <SmartImage
                      src={img}
                      alt={productName + ' image'}
                      width={600}
                      height={520}
                      className="object-contain w-full h-full transition-all duration-500"
                    />
                    {/* Zoom icon overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                        <ZoomIn className="w-6 h-6 text-gray-700" />
                      </div>
                    </div>
                    {/* Overlay image index */}
                    <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10 select-none pointer-events-none">
                      {selectedIndex + 1}/{images.length}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thumbnails with white card backgrounds */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto w-full justify-center md:justify-start h-[80px] md:h-[110px] pt-2 md:pt-3">
          {images.map((img, idx) => (
            <button
              key={img}
              onClick={() => {
                emblaApi && emblaApi.scrollTo(idx);
              }}
              ref={(el) => {
                thumbRefs.current[idx] = el;
              }}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-lg transition-all duration-150 overflow-hidden focus:outline-none focus:ring-2 focus:ring-red-400 border-2 md:border-2 p-0.5 md:p-1 bg-white shadow-md ${idx === 0 ? 'ml-2 md:ml-4' : ''} ${selectedIndex === idx ? 'border-red-600 shadow-lg ring-1 ring-red-400' : 'border-gray-200'}`}
              aria-label={`Xem ảnh ${idx + 1}`}
              tabIndex={0}
              type="button"
            >
              <div className="relative w-full h-full bg-white flex items-center justify-center">
                <SmartImage
                  src={img}
                  alt={productName + ' thumbnail'}
                  width={80}
                  height={80}
                  className="object-contain w-full h-full"
                />
              </div>
            </button>
          ))}
        </div>
      )}



      {/* Zoom Popup */}
      <ImageZoomPopup
        isOpen={isZoomOpen}
        onClose={() => {
          setIsZoomOpen(false);
        }}
        images={images}
        currentIndex={selectedIndex}
        onIndexChange={setSelectedIndex}
        productName={productName}
      />
    </div>
  );
}
