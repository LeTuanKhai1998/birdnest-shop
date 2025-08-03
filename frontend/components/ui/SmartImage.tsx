"use client";

import React from "react";
import Image from "next/image";
import { UploadThingImage } from "./UploadThingImage";
import { isUploadThingUrl } from "@/lib/uploadthing-utils";

interface SmartImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: (error: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  fallbackSrc?: string;
}

export function SmartImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  onLoad,
  onError,
  fallbackSrc,
}: SmartImageProps) {
  // Ensure src is a string
  const imageSrc = typeof src === 'string' ? src : fallbackSrc || '/images/placeholder-image.svg';
  
  // Check if the URL is from UploadThing
  if (isUploadThingUrl(imageSrc)) {
    return (
      <UploadThingImage
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onLoad={onLoad}
        onError={onError}
        fallbackSrc={fallbackSrc}
      />
    );
  }

  // Use Next.js Image for other URLs
  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width || 400}
      height={height || 400}
      className={className}
      priority={priority}
      onLoad={onLoad}
      onError={onError}
    />
  );
} 