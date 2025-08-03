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
  Info,
  Image as ImageIconAlt,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  compressImage, 
  validateImageFile, 
  formatFileSize,
  generateUploadId 
} from "@/lib/upload-utils";

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
  entityId?: string; // For filename generation
  compressionOptions?: {
    maxWidthOrHeight?: number;
    maxSizeMB?: number;
    useWebWorker?: boolean;
  };
}

interface UploadResponse {
  ufsUrl: string;
  url?: string;
  serverUrl?: string;
  name: string;
  size: number;
  type: string;
  filename?: string; // Our custom filename
  originalName?: string;
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
  onImagesChange,
  entityId = "product-default",
  compressionOptions = {},
}: ProductImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<number>(0);

  const handleUploadComplete = useCallback((res: UploadResponse[]) => {
    setIsUploading(false);
    setCompressionProgress(0);
    
    const urls = res.map((file: UploadResponse) => file.ufsUrl || file.url || '');
    
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
      description: `${res.length} hình ảnh đã được tải lên với nén tự động`,
      variant: "success",
    });
  }, [currentImages, onImagesChange, onUpload]);

  const handleUploadError = useCallback((error: Error) => {
    setIsUploading(false);
    setCompressionProgress(0);
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

  const handleUploadBegin = useCallback(() => {
    setIsUploading(true);
    setCompressionProgress(0);
  }, []);

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
    <Card className={cn("hover:shadow-lg transition-shadow duration-200", className)}>
      <CardHeader className="pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ImageIconAlt className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2 text-[#a10000]">
              {title}
              <Badge variant="secondary" className="text-xs">Bắt buộc</Badge>
            </CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </div>
        </div>
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
              <br />
              <span className="text-blue-600 font-medium">Hình ảnh sẽ được tự động nén để tối ưu hiệu suất.</span>
            </p>
          </div>

          {/* Drag & Drop Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive 
                ? "border-[#a10000] bg-red-50" 
                : "border-gray-300 hover:border-[#a10000] hover:bg-red-50"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-[#a10000] rounded-full">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  Nhấp để tải lên hoặc kéo thả
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, WEBP tối đa {maxSize}MB (tự động nén)
                </p>
                {isUploading && (
                  <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {compressionProgress > 0 && compressionProgress < 100 
                      ? `Đang nén... ${Math.round(compressionProgress)}%`
                      : "Đang tải lên..."
                    }
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <UploadButton
                  endpoint={endpoint}
                  onUploadBegin={handleUploadBegin}
                  onClientUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  className="ut-button:bg-white ut-button:text-[#a10000] ut-button:hover:bg-gray-50 ut-button:hover:text-[#a10000] ut-button:focus:bg-gray-50 ut-button:focus:text-[#a10000] ut-button:active:bg-gray-100 ut-button:active:text-[#a10000] ut-button:rounded-md ut-button:px-6 ut-button:py-3 ut-button:font-medium ut-button:transition-all ut-button:duration-200 ut-button:shadow-md ut-button:border ut-button:border-[#a10000] ut-button:min-w-[200px] ut-button:outline-none"
                  content={{
                    button: (
                      <div className="flex items-center justify-center gap-2 text-[#a10000] font-medium">
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[#a10000]" />
                        ) : (
                          <Upload className="h-4 w-4 text-[#a10000]" />
                        )}
                        {isUploading ? "Đang xử lý..." : "Chọn hình ảnh"}
                      </div>
                    ),
                    allowedContent: `Tối đa ${maxFiles} file, mỗi file ${maxSize}MB (tự động nén)`,
                  }}
                />
              </div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#a10000] transition-colors shadow-md">
                    <Image
                      src={image.url}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', image.url);
                        e.currentTarget.src = '/images/placeholder-image.svg';
                      }}
                    />
                    
                    {/* Primary Badge */}
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-[#a10000] text-white text-xs px-2 py-1">
                          <Star className="w-3 h-3 mr-1" />
                          Chính
                        </Badge>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center gap-2 pointer-events-none">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 pointer-events-auto">
                        {!image.isPrimary && currentImages.length > 1 && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 w-8 p-0 bg-white hover:bg-gray-100"
                            onClick={() => setPrimaryImage(index)}
                          >
                            <Star className="w-4 h-4 text-[#a10000]" />
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
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Info className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-[#a10000] text-sm">
                  Mẹo cho hình ảnh sản phẩm đẹp
                  <Badge variant="secondary" className="text-xs">Hướng dẫn</Badge>
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#a10000] rounded-full"></div>
                Sử dụng ảnh rõ nét, ánh sáng tốt
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#a10000] rounded-full"></div>
                Sản phẩm phải chiếm ít nhất 70% khung hình
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#a10000] rounded-full"></div>
                Nền trắng hoặc đơn giản để sản phẩm nổi bật
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#a10000] rounded-full"></div>
                Tỷ lệ khung hình vuông (1:1) phù hợp nhất
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#a10000] rounded-full"></div>
                Kích thước file dưới {maxSize}MB để tải nhanh
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span className="text-blue-600 font-medium">Hình ảnh sẽ được tự động nén và tối ưu</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isUploading && (
          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#a10000]"></div>
              <span className="text-sm text-gray-600">
                {compressionProgress > 0 && compressionProgress < 100 
                  ? `Đang nén hình ảnh... ${Math.round(compressionProgress)}%`
                  : "Đang tải lên hình ảnh..."
                }
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 