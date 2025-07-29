'use client';

import { Truck, Gift, Star } from 'lucide-react';
import { HOME_CONSTANTS } from '@/lib/constants';

export function PromotionalBanner() {
  return (
    <section className="w-full bg-gradient-to-r from-red-600 to-red-700 py-4 sm:py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-white">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-sm sm:text-base font-semibold">
              {HOME_CONSTANTS.shipping.message} cho đơn hàng từ {HOME_CONSTANTS.shipping.freeThreshold}
            </span>
          </div>
          
          <div className="hidden sm:block w-px h-6 bg-white/30"></div>
          
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-sm sm:text-base font-semibold">
              Tặng quà miễn phí cho đơn hàng đầu tiên
            </span>
          </div>
          
          <div className="hidden sm:block w-px h-6 bg-white/30"></div>
          
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            <span className="text-sm sm:text-base font-semibold">
              Chất lượng 5 sao được đảm bảo
            </span>
          </div>
        </div>
      </div>
    </section>
  );
} 