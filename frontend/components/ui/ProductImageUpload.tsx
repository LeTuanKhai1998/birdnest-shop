"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ImageIcon, 
  X, 
  Upload, 
  Camera, 
  Star, 
  Trash2, 
  Move,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ProductImageUploadProps {
  endpoint: "productImageUploader";
  onUpload?: (urls: string[]) => void;
  onUploadError?: (error: Error) => void;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
  title?: string;
  description?: string;
  currentImages?: { url: string; isPrimary?: boolean }[];
  onImagesChange?: (images: { url: string; isPrimary?: boolean }[]) => void;
}

interface UploadResponse {
  ufsUrl: string;
  url?: string;
  serverUrl?: string;
  name: string;
  size: number;
  type: string;
}

export function ProductImageUpload({
  endpoint,
  onUpload,
  onUploadError,
  maxFiles = 10,
  maxSize = 4,
  className = "",
  title = "Hình ảnh sản phẩm",
  description = "Tải lên hình ảnh sản phẩm chất lượng cao",
  currentImages = [],
  onImagesChange
}: ProductImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUploadComplete = useCallback((res: UploadResponse[]) => {
    setIsUploading(false);
    const urls = res.map((file: UploadResponse) => file.ufsUrl);
    
    // Add new images to current images
    const newImages = urls.map((url, index) => ({
      url,
      isPrimary: currentImages.length === 0 && index === 0, // First image becomes primary if no existing images
    }));
    
    const updatedImages = [...currentImages, ...newImages];
    
    if (onImagesChange) {
      onImagesChange(updatedImages);
    }
    
    if (onUpload) {
      onUpload(urls);
    }
    
    toast({
      title: "Tải lên thành công",
      description: `${urls.length} hình ảnh đã được tải lên`,
    });
  }, [currentImages, onImagesChange, onUpload]);

  const handleUploadError = useCallback((error: Error) => {
    setIsUploading(false);
    console.error("Upload error:", error);
    
    if (onUploadError) {
      onUploadError(error);
    }
    
    toast({
      title: "Tải lên thất bại",
      description: error.message,
      variant: "destructive",
    });
  }, [onUploadError]);

  const removeImage = useCallback((index: number) => {
    const updatedImages = currentImages.filter((_, i) => i !== index);
    
    // If we're removing the primary image, make the first remaining image primary
    if (currentImages[index]?.isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
    }
    
    if (onImagesChange) {
      onImagesChange(updatedImages);
    }
  }, [currentImages, onImagesChange]);

  const setPrimaryImage = useCallback((index: number) => {
    const updatedImages = currentImages.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    
    if (onImagesChange) {
      onImagesChange(updatedImages);
    }
  }, [currentImages, onImagesChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file drop - this would need to be integrated with UploadButton
      // For now, we'll just show a toast
      toast({
        title: "Thả file",
        description: "Vui lòng sử dụng nút tải lên để chọn file",
      });
    }
  }, []);

  return (
    <Card className={cn("border-l-4 border-l-blue-500 hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pt-4">
        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-blue-600" />
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pb-6">
        {/* Upload Area */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tải lên hình ảnh sản phẩm
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Chọn ảnh rõ nét, chất lượng cao. Khuyến nghị: 800x800 pixel, dưới {maxSize}MB.
            </p>
          </div>

          {/* Drag & Drop Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 hover:border-gray-400"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Camera className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  Nhấp để tải lên hoặc kéo thả
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, WEBP tối đa {maxSize}MB
                </p>
              </div>

              <UploadButton
                endpoint={endpoint}
                onUploadBegin={() => setIsUploading(true)}
                onClientUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                className="ut-button:bg-blue-600 ut-button:text-white ut-button:hover:bg-blue-700 ut-button:rounded-md ut-button:px-6 ut-button:py-2 ut-button:font-medium ut-button:transition-colors"
                content={{
                  button: (
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      {isUploading ? "Đang tải lên..." : "Chọn hình ảnh"}
                    </div>
                  ),
                  allowedContent: `Tối đa ${maxFiles} file, mỗi file ${maxSize}MB`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Current Images Grid */}
        {currentImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                Hình ảnh đã tải lên ({currentImages.length})
              </h4>
              {currentImages.length > 1 && (
                <p className="text-xs text-gray-500">
                  Nhấp vào ngôi sao để đặt làm ảnh chính
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-colors">
                    <Image
                      src={image.url}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Primary Badge */}
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
                          <Star className="w-3 h-3 mr-1" />
                          Chính
                        </Badge>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!image.isPrimary && currentImages.length > 1 && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setPrimaryImage(index)}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Image Info */}
                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-500">
                      Ảnh {index + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-900">
                Mẹo cho hình ảnh sản phẩm đẹp
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Sử dụng ảnh rõ nét, ánh sáng tốt
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Sản phẩm phải chiếm ít nhất 70% khung hình
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Nền trắng hoặc đơn giản để sản phẩm nổi bật
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Tỷ lệ khung hình vuông (1:1) phù hợp nhất
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Kích thước file dưới {maxSize}MB để tải nhanh
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isUploading && (
          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Đang tải lên hình ảnh...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 