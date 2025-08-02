"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { isUploadThingUrl } from "@/lib/uploadthing-utils";

interface UploadThingImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: (error: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  fallbackSrc?: string;
}

export function UploadThingImage({
  src,
  alt,
  className,
  width,
  height,
  onLoad,
  onError,
  fallbackSrc = "/images/placeholder-image.svg",
}: UploadThingImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    if (src && src !== imageSrc) {
      setImageSrc(src);
      setIsLoading(true);
      setHasError(false);
    }
  }, [src, imageSrc]);

  // Auto-hide loading state after 5 seconds as fallback
  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleImageError = (error: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    setIsLoading(false);
    if (fallbackSrc && fallbackSrc !== imageSrc) {
      setImageSrc(fallbackSrc);
    }
    onError?.(error);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10 pointer-events-none">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            <div className="text-xs text-gray-500">Loading image...</div>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10 pointer-events-none">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 text-gray-400">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-xs text-gray-500">Failed to load image</div>
          </div>
        </div>
      )}

      {/* Image */}
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "w-full h-full transition-opacity duration-200",
          className || "object-cover rounded-lg",
          isLoading && "opacity-0"
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />


    </div>
  );
} 