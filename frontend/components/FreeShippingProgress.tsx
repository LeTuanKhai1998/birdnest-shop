'use client';

import { useFreeShippingThreshold } from '@/lib/settings-context';
import { formatCurrency } from '@/lib/shipping-utils';
import { Truck, CheckCircle } from 'lucide-react';

interface FreeShippingProgressProps {
  cartTotal: number;
  className?: string;
}

export function FreeShippingProgress({ cartTotal, className = '' }: FreeShippingProgressProps) {
  const freeShippingThreshold = useFreeShippingThreshold();
  
  const progress = Math.min((cartTotal / freeShippingThreshold) * 100, 100);
  const remaining = Math.max(0, freeShippingThreshold - cartTotal);
  const isFreeShipping = cartTotal >= freeShippingThreshold;

  if (isFreeShipping) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Bạn đã đủ điều kiện miễn phí vận chuyển! 🎉</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Truck className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-900">
          Mua thêm {formatCurrency(remaining)} để được miễn phí vận chuyển
        </span>
      </div>
      <div className="w-full bg-blue-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-blue-700 mt-1">
        <span>{formatCurrency(cartTotal)}</span>
        <span>{formatCurrency(freeShippingThreshold)}</span>
      </div>
    </div>
  );
} 