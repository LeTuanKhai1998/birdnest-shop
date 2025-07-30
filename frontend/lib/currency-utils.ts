import { useCurrency } from './settings-context';

// Format currency based on the store's currency setting
export function formatCurrency(amount: number | string, currency?: string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0';
  }

  const currencyCode = currency || 'VND';
  
  // Format based on currency type
  switch (currencyCode.toUpperCase()) {
    case 'VND':
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numAmount);
    
    case 'USD':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numAmount);
    
    case 'EUR':
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numAmount);
    
    default:
      // Generic formatting for other currencies
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numAmount);
  }
}

// Format price with discount
export function formatPriceWithDiscount(originalPrice: number | string, discountPercent: number, currency?: string): {
  original: string;
  discounted: string;
  savings: string;
} {
  const numPrice = typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice;
  const discount = discountPercent / 100;
  const discountedPrice = numPrice * (1 - discount);
  const savings = numPrice - discountedPrice;

  return {
    original: formatCurrency(numPrice, currency),
    discounted: formatCurrency(discountedPrice, currency),
    savings: formatCurrency(savings, currency),
  };
}

// Calculate tax amount
export function calculateTax(amount: number | string, taxPercent: number): number {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (numAmount * taxPercent) / 100;
}

// Calculate total with tax
export function calculateTotalWithTax(amount: number | string, taxPercent: number): number {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return numAmount + calculateTax(numAmount, taxPercent);
}

// Check if order qualifies for free shipping
export function qualifiesForFreeShipping(orderTotal: number | string, threshold: number): boolean {
  const numTotal = typeof orderTotal === 'string' ? parseFloat(orderTotal) : orderTotal;
  return numTotal >= threshold;
}

// Format shipping cost
export function formatShippingCost(cost: number | string, currency?: string): string {
  const numCost = typeof cost === 'string' ? parseFloat(cost) : cost;
  
  if (numCost === 0) {
    return 'Free';
  }
  
  return formatCurrency(numCost, currency);
}

// React hook for currency formatting
export function useCurrencyFormat() {
  const currency = useCurrency();
  
  return {
    format: (amount: number | string) => formatCurrency(amount, currency),
    currency,
  };
} 