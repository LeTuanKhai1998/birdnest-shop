'use client';

import { Truck, Gift, Star } from 'lucide-react';
import { HOME_CONSTANTS } from '@/lib/constants';

export function PromotionalBanner() {
  return (
    <section className="w-full bg-gradient-to-r from-red-600 to-red-700 py-3 sm:py-4 md:py-6">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 md:gap-8 text-white">
          {/* Free Shipping */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
            <span className="text-xs sm:text-sm md:text-base font-semibold text-center leading-tight">
              {HOME_CONSTANTS.shipping.message} cho đơn hàng từ {HOME_CONSTANTS.shipping.freeThreshold}
            </span>
          </div>
          
          {/* Divider - hidden on mobile, visible on desktop */}
          <div className="hidden sm:block w-px h-6 bg-white/30"></div>
          
          {/* Free Gift */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Gift className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
            <span className="text-xs sm:text-sm md:text-base font-semibold text-center leading-tight">
              Tặng quà miễn phí cho đơn hàng đầu tiên
            </span>
          </div>
          
          {/* Divider - hidden on mobile, visible on desktop */}
          <div className="hidden sm:block w-px h-6 bg-white/30"></div>
          
          {/* Quality Guarantee */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current flex-shrink-0" />
            <span className="text-xs sm:text-sm md:text-base font-semibold text-center leading-tight">
              Chất lượng 5 sao được đảm bảo
            </span>
          </div>
        </div>
      </div>
    </section>
  );
} 