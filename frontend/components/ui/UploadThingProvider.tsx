"use client";

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Re-export UploadButton for convenience
export { UploadButton };

export function UploadThingProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 