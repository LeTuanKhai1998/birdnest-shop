import { useFreeShippingThreshold } from './settings-context';

// Default shipping fee (can be adjusted)
const DEFAULT_SHIPPING_FEE = 30000; // 30,000 VND

/**
 * Calculate shipping fee based on cart total and free shipping threshold
 */
export function calculateShippingFee(cartTotal: number, freeShippingThreshold: number): number {
  if (cartTotal >= freeShippingThreshold) {
    return 0; // Free shipping
  }
  return DEFAULT_SHIPPING_FEE;
}

/**
 * Check if free shipping applies
 */
export function isFreeShipping(cartTotal: number, freeShippingThreshold: number): boolean {
  return cartTotal >= freeShippingThreshold;
}

/**
 * Calculate remaining amount needed for free shipping
 */
export function getRemainingForFreeShipping(cartTotal: number, freeShippingThreshold: number): number {
  const remaining = freeShippingThreshold - cartTotal;
  return Math.max(0, remaining);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'VND'): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Hook to get shipping information
 */
export function useShippingInfo(cartTotal: number) {
  const freeShippingThreshold = useFreeShippingThreshold();
  
  const shippingFee = calculateShippingFee(cartTotal, freeShippingThreshold);
  const isFree = isFreeShipping(cartTotal, freeShippingThreshold);
  const remaining = getRemainingForFreeShipping(cartTotal, freeShippingThreshold);
  
  return {
    shippingFee,
    isFree,
    remaining,
    freeShippingThreshold,
  };
} 