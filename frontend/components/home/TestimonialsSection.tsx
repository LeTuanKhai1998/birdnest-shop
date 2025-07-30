'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { HOME_CONSTANTS } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { SlideUpSection, FadeInSection } from '@/components/ui/ScrollAnimation';

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const itemsPerPage = 3;
  const totalItems = HOME_CONSTANTS.testimonials.items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  }, [totalPages]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  }, [totalPages]);

  const handlePause = () => {
    setIsAutoPlaying(false);
  };

  const handleResume = () => {
    setIsAutoPlaying(true);
  };

  // Auto-scroll effect
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      handleNext();
    }, 2000); // 2 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, handleNext]);

  const getVisibleTestimonials = () => {
    const startIndex = currentIndex * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return HOME_CONSTANTS.testimonials.items.slice(startIndex, endIndex);
  };

  return (
    <section className="w-full bg-white py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <SlideUpSection>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-red-700">
            {HOME_CONSTANTS.testimonials.title}
          </h2>
        </SlideUpSection>
        
        <FadeInSection className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handlePause();
              handlePrevious();
            }}
            onMouseEnter={handlePause}
            className="absolute -left-12 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 p-0 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 bg-white/90 backdrop-blur-sm shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handlePause();
              handleNext();
            }}
            onMouseEnter={handlePause}
            className="absolute -right-12 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 p-0 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 bg-white/90 backdrop-blur-sm shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
                    <div 
            className="flex justify-center items-center overflow-hidden"
            onMouseEnter={handlePause}
            onMouseLeave={handleResume}
          >
            <AnimatePresence mode="wait">
              <div
                key={currentIndex}
                className="flex gap-4 sm:gap-6 w-full max-w-6xl"
                style={{
                  transform: 'translateX(0)',
                  opacity: 1,
                  transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {getVisibleTestimonials().map((testimonial, index) => (
                  <div key={`testimonial-${currentIndex}-${index}`} className="flex-shrink-0 w-full md:w-80 lg:w-96">
                    <motion.div
                      key={`${currentIndex}-${index}`}
                      initial={{ opacity: 0, y: 30, scale: 0.9, rotateY: -15 }}
                      animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
                      exit={{ opacity: 0, y: -30, scale: 0.9, rotateY: 15 }}
                      transition={{ 
                        duration: 0.7, 
                        delay: index * 0.15,
                        ease: [0.4, 0, 0.2, 1],
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }}
                      whileHover={{ 
                        y: -8, 
                        scale: 1.03,
                        rotateY: 2,
                        transition: { 
                          duration: 0.3,
                          ease: "easeOut"
                        }
                      }}
                      whileTap={{ 
                        scale: 0.98,
                        transition: { duration: 0.1 }
                      }}
                    >
                    <Card className="h-full p-4 sm:p-6 bg-gradient-to-br from-red-50 to-orange-50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:rotate-1">
                      <CardContent className="p-0 h-full flex flex-col">
                        <div className="flex items-start mb-4 sm:mb-5">
                          <motion.div
                            whileHover={{ 
                              scale: 1.15, 
                              rotate: 5,
                              transition: { duration: 0.3, ease: "easeOut" }
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Image
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              width={40}
                              height={40}
                              className="rounded-full mr-3 sm:mr-4 w-10 h-10 sm:w-12 sm:h-12 shadow-md"
                            />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="font-semibold text-red-700 text-sm sm:text-base animate-fade-in-left mb-1"
                              style={{
                                animationDelay: '0.2s',
                                animationDuration: '0.5s',
                                animationFillMode: 'both'
                              }}
                            >
                              {testimonial.name}
                            </h4>
                            <div className="flex items-center">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star 
                                  key={i}
                                  className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="mb-3">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.6, duration: 0.4 }}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                              <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                            </motion.div>
                          </div>
                          <p
                            className="text-gray-600 italic text-sm sm:text-base leading-relaxed animate-fade-in-up flex-1"
                            style={{
                              animationDelay: '0.7s',
                              animationDuration: '0.5s',
                              animationFillMode: 'both'
                            }}
                          >
                            {'"'}
                            {testimonial.comment}
                            {'"'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                    </div>
                ))}
              </div>
            </AnimatePresence>
          </div>
        </FadeInSection>
        
        {/* Pagination Dots */}
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-red-700'
                  : 'bg-red-200 hover:bg-red-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 