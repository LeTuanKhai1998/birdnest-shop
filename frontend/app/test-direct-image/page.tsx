"use client";

import React from "react";
import { BasicImage } from "@/components/ui/BasicImage";

export default function TestDirectImagePage() {
  const testUrls = [
    "https://utfs.io/f/snhNmhXZ13Q01gUXdhIWTcQHk67UAtOB12WP3lbd8yorwiZz",
    "https://utfs.io/f/snhNmhXZ13Q0ldO7uoQgrK76hSLmtX1HVWBNpZ0j9UadzPMq",
  ];

  const handleImageLoad = (url: string) => {
    console.log("✅ Image loaded successfully:", url);
  };

  const handleImageError = (url: string) => {
    console.error("❌ Image failed to load:", url);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Direct Image Test</h1>
        <p className="text-gray-600 mb-8">
          Testing direct loading of UploadThing images
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testUrls.map((url, index) => (
          <div key={index} className="space-y-4">
            <h3 className="font-medium">Test Image {index + 1}</h3>
            <BasicImage
              src={url}
              alt={`Test image ${index + 1}`}
              onLoad={() => handleImageLoad(url)}
              onError={() => handleImageError(url)}
            />
            <div className="text-xs text-gray-500 break-all">
              <strong>URL:</strong> {url}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Check browser console for load/error messages
        </p>
      </div>
    </div>
  );
} 