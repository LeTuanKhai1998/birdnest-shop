"use client";

import { UploadButton } from "@/lib/uploadthing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export default function TestUploadThing() {
  const handleUploadComplete = (res: any) => {
    console.log("Upload completed:", res);
    const urls = res.map((file: any) => file.ufsUrl);
    toast({
      title: "Upload successful",
      description: `Uploaded ${urls.length} file(s)`,
    });
  };

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error);
    toast({
      title: "Upload failed",
      description: error.message,
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">UploadThing Test</h1>
        <p className="text-muted-foreground">
          Test the UploadThing integration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Upload Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">Test</Badge>
              Basic Upload
            </CardTitle>
            <CardDescription>
              Simple upload button test
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-md ut-button:px-4 ut-button:py-2 ut-button:font-medium"
              content={{
                button: "Test Upload",
                allowedContent: "Images up to 4MB",
              }}
            />
          </CardContent>
        </Card>

        {/* Multiple Files Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">Test</Badge>
              Multiple Files
            </CardTitle>
            <CardDescription>
              Upload multiple images test
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadButton
              endpoint="generalImageUploader"
              onClientUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-md ut-button:px-4 ut-button:py-2 ut-button:font-medium"
              content={{
                button: "Upload Multiple",
                allowedContent: "Up to 5 images, 4MB each",
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle>UploadThing Status</CardTitle>
          <CardDescription>
            Configuration and setup information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Configuration</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✅ FileRouter configured</li>
                <li>✅ API route handler</li>
                <li>✅ Tailwind integration</li>
                <li>✅ SSR plugin</li>
                <li>✅ Authentication middleware</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Endpoints</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• imageUploader (1 file, 4MB)</li>
                <li>• productImageUploader (10 files, admin only)</li>
                <li>• generalImageUploader (5 files)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 