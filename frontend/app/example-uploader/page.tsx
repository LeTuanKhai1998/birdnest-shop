"use client";

import { useState } from "react";
import { UploadButton } from "@/lib/uploadthing";
import { ImageUpload, SimpleUploadButton } from "@/components/ui/ImageUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

export default function ExampleUploader() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleUploadComplete = (res: any) => {
    console.log("Files: ", res);
    const urls = res.map((file: any) => file.ufsUrl);
    setUploadedImages(prev => [...prev, ...urls]);
    toast({
      title: "Upload Completed",
      description: `${urls.length} file(s) uploaded successfully`,
    });
  };

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error);
    toast({
      title: "Upload Failed",
      description: error.message,
      variant: "destructive",
    });
  };

  const clearImages = () => {
    setUploadedImages([]);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">UploadThing Example</h1>
        <p className="text-muted-foreground">
          This page demonstrates how to use UploadThing for image uploads
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Upload Button (Official Guide Style) */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Upload Button</CardTitle>
            <CardDescription>
              Simple upload button following the official guide
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-md ut-button:px-4 ut-button:py-2 ut-button:font-medium"
              content={{
                button: "Choose File",
                allowedContent: "Images up to 4MB",
              }}
            />
          </CardContent>
        </Card>

        {/* Custom Image Upload Component */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Upload Component</CardTitle>
            <CardDescription>
              Advanced upload component with preview and management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              endpoint="generalImageUploader"
              title="Upload Multiple Images"
              description="Upload up to 5 images, 4MB each"
              onUploadComplete={(url) => {
                console.log("Single image uploaded:", url);
              }}
              onUploadError={handleUploadError}
            />
          </CardContent>
        </Card>
      </div>

      {/* Simple Upload Button Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Simple Upload Buttons</CardTitle>
          <CardDescription>
            Different endpoints for different use cases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Badge variant="secondary">Avatar Upload</Badge>
              <SimpleUploadButton
                endpoint="imageUploader"
                onUploadComplete={(url) => {
                  toast({
                    title: "Avatar uploaded",
                    description: "Your avatar has been updated",
                  });
                }}
                onUploadError={handleUploadError}
              />
            </div>

            <div className="space-y-2">
              <Badge variant="secondary">Product Images</Badge>
              <SimpleUploadButton
                endpoint="productImageUploader"
                onUploadComplete={(url) => {
                  toast({
                    title: "Product image uploaded",
                    description: "Image added to product gallery",
                  });
                }}
                onUploadError={handleUploadError}
              />
            </div>

            <div className="space-y-2">
              <Badge variant="secondary">General Images</Badge>
              <SimpleUploadButton
                endpoint="generalImageUploader"
                onUploadComplete={(url) => {
                  toast({
                    title: "Image uploaded",
                    description: "Image uploaded successfully",
                  });
                }}
                onUploadError={handleUploadError}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Images Display */}
      {uploadedImages.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Uploaded Images</CardTitle>
              <Button variant="outline" onClick={clearImages}>
                Clear All
              </Button>
            </div>
            <CardDescription>
              {uploadedImages.length} image(s) uploaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedImages.map((url, index) => (
                <div key={index} className="space-y-2">
                  <img
                    src={url}
                    alt={`Uploaded image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md border"
                  />
                  <p className="text-xs text-muted-foreground truncate">
                    {url.split('/').pop()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>UploadThing Features</CardTitle>
          <CardDescription>
            What this setup provides
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">File Types</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Images (PNG, JPG, JPEG, WebP)</li>
                  <li>• Max file size: 4MB</li>
                  <li>• Multiple file support</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Security</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Authentication required</li>
                  <li>• Role-based access (admin for products)</li>
                  <li>• Secure file storage</li>
                </ul>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold">Endpoints</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <Badge variant="secondary">imageUploader</Badge>
                <Badge variant="secondary">productImageUploader</Badge>
                <Badge variant="secondary">generalImageUploader</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 