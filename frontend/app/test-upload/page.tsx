"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EnhancedUploadThing } from "@/components/ui/EnhancedUploadThing";
import { UploadThingButton } from "@/components/ui/UploadThingButton";

export default function TestUploadPage() {
  const [avatarUrls, setAvatarUrls] = useState<string[]>([]);
  const [productUrls, setProductUrls] = useState<string[]>([]);
  const [generalUrls, setGeneralUrls] = useState<string[]>([]);
  const [legacyUrls, setLegacyUrls] = useState<string[]>([]);

  const handleAvatarUpload = (urls: string[]) => {
    setAvatarUrls(prev => [...prev, ...urls]);
  };

  const handleProductUpload = (urls: string[]) => {
    setProductUrls(prev => [...prev, ...urls]);
  };

  const handleGeneralUpload = (urls: string[]) => {
    setGeneralUrls(prev => [...prev, ...urls]);
  };

  const handleLegacyUpload = (urls: string[]) => {
    setLegacyUrls(prev => [...prev, ...urls]);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Upload Test Page</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test the enhanced upload functionality with image compression and filename convention
        </p>
      </div>

      <Tabs defaultValue="enhanced" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="enhanced">Enhanced Upload (with compression)</TabsTrigger>
          <TabsTrigger value="legacy">Legacy Upload (without compression)</TabsTrigger>
        </TabsList>

        <TabsContent value="enhanced" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Avatar Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Avatar Upload
                  <Badge variant="secondary">Enhanced</Badge>
                </CardTitle>
                <CardDescription>
                  Single image upload with compression and standardized filename
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedUploadThing
                  endpoint="avatarUploader"
                  onUploadComplete={handleAvatarUpload}
                  entityId="test-user-123"
                  maxFiles={1}
                  maxSize={4}
                  compressionOptions={{
                    maxWidthOrHeight: 800,
                    maxSizeMB: 1.0,
                    useWebWorker: true,
                  }}
                />
                {avatarUrls.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Uploaded URLs:</h4>
                    <div className="space-y-1">
                      {avatarUrls.map((url, index) => (
                        <div key={index} className="text-xs text-gray-600 break-all">
                          {url}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Product Images
                  <Badge variant="secondary">Enhanced</Badge>
                </CardTitle>
                <CardDescription>
                  Multiple images with compression and product filename convention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedUploadThing
                  endpoint="productImageUploader"
                  onUploadComplete={handleProductUpload}
                  entityId="product-456"
                  maxFiles={5}
                  maxSize={4}
                  compressionOptions={{
                    maxWidthOrHeight: 1080,
                    maxSizeMB: 1.5,
                    useWebWorker: true,
                  }}
                />
                {productUrls.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Uploaded URLs:</h4>
                    <div className="space-y-1">
                      {productUrls.map((url, index) => (
                        <div key={index} className="text-xs text-gray-600 break-all">
                          {url}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* General Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  General Images
                  <Badge variant="secondary">Enhanced</Badge>
                </CardTitle>
                <CardDescription>
                  Multiple images with compression and general filename convention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedUploadThing
                  endpoint="generalImageUploader"
                  onUploadComplete={handleGeneralUpload}
                  entityId="general-789"
                  maxFiles={3}
                  maxSize={4}
                  compressionOptions={{
                    maxWidthOrHeight: 1200,
                    maxSizeMB: 2.0,
                    useWebWorker: true,
                  }}
                />
                {generalUrls.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Uploaded URLs:</h4>
                    <div className="space-y-1">
                      {generalUrls.map((url, index) => (
                        <div key={index} className="text-xs text-gray-600 break-all">
                          {url}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="legacy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Legacy Avatar Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Legacy Avatar Upload
                  <Badge variant="outline">Legacy</Badge>
                </CardTitle>
                <CardDescription>
                  Original upload without compression
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadThingButton
                  endpoint="avatarUploader"
                  onUploadComplete={handleLegacyUpload}
                  maxFiles={1}
                  maxSize={4}
                />
                {legacyUrls.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Uploaded URLs:</h4>
                    <div className="space-y-1">
                      {legacyUrls.map((url, index) => (
                        <div key={index} className="text-xs text-gray-600 break-all">
                          {url}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>
            Comparison between enhanced and legacy upload functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-green-600">Enhanced Upload Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">✓</Badge>
                  Automatic image compression before upload
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">✓</Badge>
                  Standardized filename convention: [type]-[entityId]-[timestamp].[ext]
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">✓</Badge>
                  Real-time compression progress indicator
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">✓</Badge>
                  File validation and error handling
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">✓</Badge>
                  WebP conversion for better compression
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">✓</Badge>
                  Configurable compression options
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-gray-600">Legacy Upload Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✗</Badge>
                  No image compression
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✗</Badge>
                  Original filename preserved
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✗</Badge>
                  Basic upload progress
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✗</Badge>
                  Limited file validation
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✗</Badge>
                  No format conversion
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✗</Badge>
                  Fixed upload settings
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filename Convention Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Filename Convention Examples</CardTitle>
          <CardDescription>
            Examples of the standardized filename format implemented
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Format: [type]-[entityId]-[timestamp].[ext]</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-medium">Avatar Upload:</div>
                  <div className="text-gray-600">avatar-user123-1722260100.jpg</div>
                  <div className="text-gray-600">avatar-admin456-1722260200.webp</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Product Upload:</div>
                  <div className="text-gray-600">product-789-1722260300.png</div>
                  <div className="text-gray-600">product-101-1722260400.jpg</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">General Upload:</div>
                  <div className="text-gray-600">general-202-1722260500.webp</div>
                  <div className="text-gray-600">general-303-1722260600.jpg</div>
                </div>
              </div>
            </div>
            <Separator />
            <div className="text-sm text-gray-600">
              <p><strong>Benefits:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Consistent naming across all uploads</li>
                <li>Easy to identify file type and source</li>
                <li>Timestamp ensures uniqueness</li>
                <li>No special characters or spaces</li>
                <li>Lowercase for consistency</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 