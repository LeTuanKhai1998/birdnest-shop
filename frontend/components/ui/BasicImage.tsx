"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BasicImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function BasicImage({
  src,
  alt,
  className,
  onLoad,
  onError,
}: BasicImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("w-full h-48 object-cover rounded-lg", className)}
      onLoad={onLoad}
      onError={onError}
      crossOrigin="anonymous"
    />
  );
} 