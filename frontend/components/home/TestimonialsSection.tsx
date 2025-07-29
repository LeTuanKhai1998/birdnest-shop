'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { HOME_CONSTANTS } from '@/lib/constants';

export function TestimonialsSection() {
  return (
    <section className="w-full bg-[#fbd8b0] py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-red-700">
          {HOME_CONSTANTS.testimonials.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {HOME_CONSTANTS.testimonials.items.map((testimonial, index) => (
            <Card
              key={index}
              className="p-4 sm:p-6 bg-gradient-to-br from-red-50 to-orange-50"
            >
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
                    <h4 className="font-semibold text-red-700 text-sm sm:text-base">
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
                <Quote className="w-4 h-4 sm:w-6 sm:h-6 text-red-400 mb-2" />
                <p className="text-gray-600 italic text-sm sm:text-base">
                  {'"'}
                  {testimonial.comment}
                  {'"'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 