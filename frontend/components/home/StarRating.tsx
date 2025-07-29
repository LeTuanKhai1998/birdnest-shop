'use client';

import { Star } from 'lucide-react';

export function StarRating() {
  return (
    <section className="w-full bg-gradient-to-r from-amber-50 to-yellow-50 py-6 sm:py-8 border-b border-amber-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          {/* Star Rating */}
          <div className="flex items-center gap-2 mb-3">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 fill-current drop-shadow-sm"
              />
            ))}
          </div>
          
          {/* Rating Text */}
          <div className="text-center">
            <p className="text-lg sm:text-xl font-bold text-amber-700 mb-1">
              5.0 / 5.0
            </p>
            <p className="text-sm sm:text-base text-amber-600 font-medium">
              Đánh giá xuất sắc từ hơn 1,000+ khách hàng
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className="flex items-center gap-4 mt-4">
            <div className="w-8 h-px bg-amber-300"></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
            <div className="w-8 h-px bg-amber-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
} 