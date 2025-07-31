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
  fallbackSrc = "/images/placeholder.png",
}: UploadThingImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    console.log("UploadThingImage: Image loaded successfully", { src: imageSrc });
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = (error: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("UploadThingImage: Failed to load image", { 
      src, 
      imageSrc,
      error: error.nativeEvent,
      target: error.currentTarget
    });
    setIsLoading(false);
    setHasError(true);
    
    // Try fallback if available and different from current src
    if (fallbackSrc && fallbackSrc !== imageSrc) {
      console.log("UploadThingImage: Trying fallback", fallbackSrc);
      setImageSrc(fallbackSrc);
      setIsLoading(true);
      setHasError(false);
    } else {
      onError?.(error);
    }
  };

  // Reset state when src changes
  React.useEffect(() => {
    console.log("UploadThingImage: src changed", { src, currentImageSrc: imageSrc });
    setImageSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src, imageSrc]);

  return (
    <div className={cn("relative", className)}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            <div className="text-xs text-gray-500">Loading image...</div>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
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
          "w-full h-full object-cover rounded-lg transition-opacity duration-200",
          isLoading && "opacity-0"
        )}
        onLoad={handleLoad}
        onError={handleError}
        crossOrigin={isUploadThingUrl(src) ? "anonymous" : undefined}
      />

      {/* UploadThing Badge */}
      {isUploadThingUrl(src) && !isLoading && !hasError && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          CDN
        </div>
      )}
    </div>
  );
} 