import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ProductImage } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility functions for handling ProductImage types
export function getImageUrl(image: ProductImage | string): string {
  if (typeof image === 'string') {
    return image;
  }
  return image.url;
}

export function getFirstImageUrl(images: (ProductImage | string)[] | undefined): string {
  if (!images || images.length === 0) {
    return '/images/placeholder-image.svg';
  }
  return getImageUrl(images[0]);
}

export function convertImagesToProductImages(images: (ProductImage | string)[]): ProductImage[] {
  return images.map((image, index) => {
    if (typeof image === 'string') {
      return {
        id: `temp-${index}`,
        url: image,
        isPrimary: index === 0,
        productId: '',
        createdAt: new Date().toISOString(),
      };
    }
    return image;
  });
}

export function convertImagesToStrings(images: (ProductImage | string)[]): string[] {
  return images.map(image => getImageUrl(image));
}

// SWR fetcher utility
export const fetcher = (input: RequestInfo, init?: RequestInit) =>
  fetch(input, init).then((res) => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  });
