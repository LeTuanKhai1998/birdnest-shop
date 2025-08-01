"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, X, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImageUploadProps {
  endpoint: "imageUploader" | "productImageUploader" | "generalImageUploader";
  onUploadComplete?: (url: string) => void;
  onUpload?: (urls: string[]) => void;
  onUploadError?: (error: Error) => void;
  maxFiles?: number;
  maxSize?: number;
  showPreview?: boolean;
  className?: string;
  title?: string;
  description?: string;
}

interface UploadResponse {
  ufsUrl: string;
  url?: string;
  serverUrl?: string;
  name: string;
  size: number;
  type: string;
}

export function ImageUpload({
  endpoint,
  onUploadComplete,
  onUpload,
  onUploadError,
  maxFiles,
  maxSize,
  showPreview = true,
  className = "",
  title = "Upload Image",
  description = "Click to upload or drag and drop"
}: ImageUploadProps) {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadComplete = (res: UploadResponse[]) => {
    setIsUploading(false);
    const urls = res.map((file: UploadResponse) => file.ufsUrl);
    setUploadedUrls(prev => [...prev, ...urls]);
    
    // Call the appropriate callback
    if (onUpload && urls.length > 0) {
      onUpload(urls);
    } else if (onUploadComplete && urls.length > 0) {
      onUploadComplete(urls[0]);
    }
    
    toast({
      title: "Upload successful",
      description: `${urls.length} file(s) uploaded successfully`,
    });
  };

  const handleUploadError = (error: Error) => {
    setIsUploading(false);
    console.error("Upload error:", error);
    
    if (onUploadError) {
      onUploadError(error);
    }
    
    toast({
      title: "Upload failed",
      description: error.message,
      variant: "destructive",
    });
  };

  const removeImage = (index: number) => {
    setUploadedUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className={className}>
      <CardHeader className="pt-4">
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Button */}
        <UploadButton
          endpoint={endpoint}
          onUploadBegin={() => setIsUploading(true)}
          onClientUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-md ut-button:px-4 ut-button:py-2 ut-button:font-medium"
          content={{
            button: (
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Choose File"}
              </div>
            ),
            allowedContent: `Images up to ${maxSize || 4}MB${maxFiles ? `, max ${maxFiles} files` : ''}`,
          }}
        />

        {/* Uploaded Images Preview */}
        {showPreview && uploadedUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="relative group">
                <Image
                  src={url}
                  alt={`Uploaded image ${index + 1}`}
                  width={128}
                  height={128}
                  className="w-full h-32 object-cover rounded-md border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isUploading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Uploading...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simple upload button for basic use cases
export function SimpleUploadButton({
  endpoint,
  onUploadComplete,
  onUploadError,
  className = "",
}: {
  endpoint: "imageUploader" | "productImageUploader" | "generalImageUploader";
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
}) {
  const handleUploadComplete = (res: UploadResponse[]) => {
    const urls = res.map((file: UploadResponse) => file.ufsUrl);
    if (onUploadComplete && urls.length > 0) {
      onUploadComplete(urls[0]);
    }
  };

  return (
    <UploadButton
      endpoint={endpoint}
      onClientUploadComplete={handleUploadComplete}
      onUploadError={onUploadError}
      className={`ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-md ut-button:px-4 ut-button:py-2 ut-button:font-medium ${className}`}
      content={{
        button: "Upload Image",
      }}
    />
  );
} 