"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  layout?: "fill" | "fixed" | "intrinsic" | "responsive";
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  [key: string]: any;
}

export function SafeImage({ 
  src, 
  alt, 
  fill = false,
  priority = false,
  sizes,
  className = "",
  ...props 
}: SafeImageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ 
          width: props.width || '100%', 
          height: props.height || '100%',
          position: fill ? 'relative' : 'static'
        }}
      />
    );
  }

  // If using fill, ensure parent has relative positioning
  if (fill) {
    return (
      <div className={`relative ${className}`}>
        <Image 
          src={src} 
          alt={alt} 
          fill
          sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
          priority={priority}
          className="object-cover"
          {...props}
        />
      </div>
    );
  }

  return (
    <Image 
      src={src} 
      alt={alt} 
      priority={priority}
      sizes={sizes}
      className={className}
      {...props}
    />
  );
} 