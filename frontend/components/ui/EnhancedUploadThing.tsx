"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";


interface EnhancedUploadThingProps {
  endpoint: "avatarUploader" | "productImageUploader" | "generalImageUploader";
  onUploadComplete: (urls: string[]) => void;
  onUploadError?: (error: Error) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  children?: React.ReactNode;
  entityId?: string; // For filename generation
  compressionOptions?: {
    maxWidthOrHeight?: number;
    maxSizeMB?: number;
    useWebWorker?: boolean;
  };
}

interface UploadResponse {
  ufsUrl?: string;
  url?: string;
  serverUrl?: string;
  name: string;
  size: number;
  type: string;
  filename?: string; // Our custom filename
  originalName?: string;
}

interface ClientUploadButtonProps {
  endpoint: string;
  onUploadComplete: (res: UploadResponse[]) => void;
  onUploadError?: (error: Error) => void;
  onUploadBegin?: () => void;
  config?: Record<string, unknown>;
  appearance?: Record<string, unknown>;
  content?: Record<string, React.ReactNode>;
  disabled?: boolean;
  entityId?: string;
}

// Client-only wrapper for UploadButton
function ClientUploadButton({ 
  endpoint, 
  onUploadComplete, 
  onUploadError, 
  onUploadBegin, 
  ...props 
}: ClientUploadButtonProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [UploadButtonComponent, setUploadButtonComponent] = useState<any>(null);

  useEffect(() => {
    // Dynamically import UploadButton only on client
    import("@uploadthing/react").then((module) => {
      setUploadButtonComponent(() => module.UploadButton);
    });
  }, []);

  if (!UploadButtonComponent) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Loading upload component...
        </div>
      </div>
    );
  }

  return (
    <UploadButtonComponent
      endpoint={endpoint}
      onClientUploadComplete={onUploadComplete}
      onUploadError={onUploadError}
      onUploadBegin={onUploadBegin}
      {...props}
    />
  );
}

export function EnhancedUploadThing({
  endpoint,
  onUploadComplete,
  onUploadError,
  maxFiles = 1,
  maxSize = 4,
  className,
  disabled = false,
  showPreview = true,
  children,
  entityId = "default",

}: EnhancedUploadThingProps) {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<number>(0);

  // Ensure component only renders on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleUploadComplete = useCallback((res: UploadResponse[]) => {
    if (res && res.length > 0) {
      const urls: string[] = [];
      
      res.forEach((item) => {
        if (item.url) {
          urls.push(item.url);
        }
      });
      
      if (urls.length > 0) {
        setUploadedUrls(prev => [...prev, ...urls]);
        onUploadComplete(urls);
        
        toast({
          title: "Upload successful",
          description: `${res.length} image(s) uploaded with compression`,
          variant: "success",
        });
      }
    }
    setIsUploading(false);
    setCompressionProgress(0);
  }, [onUploadComplete]);

  const handleUploadError = useCallback((error: Error) => {
    console.error("Upload failed:", error);
    setIsUploading(false);
    setCompressionProgress(0);
    
    toast({
      title: "Upload failed",
      description: error.message || "Failed to upload file",
      variant: "destructive",
    });
    
    if (onUploadError) {
      onUploadError(error);
    }
  }, [onUploadError]);

  const handleUploadBegin = useCallback(() => {
    setIsUploading(true);
    setCompressionProgress(0);
  }, []);

  const removeImage = useCallback((index: number) => {
    setUploadedUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      onUploadComplete(newUrls);
      return newUrls;
    });
  }, [onUploadComplete]);



  // Don't render anything on server
  if (!isClient) {
    return (
      <div className={cn("space-y-4", className)}>
        <Card className={cn(
          "border-2 border-dashed border-gray-300 dark:border-gray-600",
          "p-6 text-center",
          disabled && "opacity-50 cursor-not-allowed"
        )}>
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-pulse bg-gray-200 rounded-full h-8 w-8" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Loading upload component...
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card className={cn(
        "border-2 border-dashed border-gray-300 dark:border-gray-600",
        "hover:border-gray-400 dark:hover:border-gray-500 transition-colors",
        "p-6 text-center",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
        <ClientUploadButton
          endpoint={endpoint}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          onUploadBegin={handleUploadBegin}
          entityId={entityId}
          config={{
            mode: "auto",
            // Pass entityId to the server for filename generation
            input: {
              entityId: entityId,
            },
          }}
          appearance={{
            button: cn(
              "bg-transparent border-0 p-0 w-full h-full",
              "flex flex-col items-center space-y-2",
              "cursor-pointer",
              (disabled || isUploading) && "cursor-not-allowed opacity-50"
            ),
            allowedContent: "hidden",
          }}
          content={{
            button: (
              <div className="flex flex-col items-center space-y-2">
                {isUploading ? (
                  <div className="flex flex-col items-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {compressionProgress > 0 && compressionProgress < 100 
                        ? `Compressing... ${Math.round(compressionProgress)}%`
                        : "Uploading..."
                      }
                    </div>
                  </div>
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-primary hover:text-primary/80">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  JPEG, PNG, WebP up to {maxSize}MB (auto-compressed)
                </div>
                {maxFiles > 1 && (
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Max {maxFiles} files
                  </div>
                )}
                <div className="text-xs text-blue-500">
                  Images will be automatically compressed for optimal performance
                </div>
              </div>
            ),
          }}
          disabled={disabled || isUploading}
        />
      </Card>

      {/* Preview */}
      {showPreview && uploadedUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedUrls.map((url, index) => (
            <div key={index} className="relative group">
              <Image
                src={url}
                alt={`Uploaded image ${index + 1}`}
                width={96}
                height={96}
                className="w-full h-24 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  );
} 