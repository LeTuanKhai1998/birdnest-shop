"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UploadThingImage } from "@/components/ui/UploadThingImage";
import { isUploadThingUrl, getUploadThingDomain } from "@/lib/uploadthing-utils";

export default function TestImageDirectPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [testResults, setTestResults] = useState<any[]>([]);

  const testImage = async (url: string) => {
    const results: Array<{
      test: string;
      result: string;
      details?: any;
    }> = [];
    
    // Test 1: Check if it's an UploadThing URL
    const isUT = isUploadThingUrl(url);
    results.push({ test: "UploadThing URL", result: isUT ? "✅ Yes" : "❌ No" });
    
    // Test 2: Get domain
    const domain = getUploadThingDomain(url);
    results.push({ test: "Domain", result: domain });
    
    // Test 3: Test fetch
    try {
      const response = await fetch(url, { method: 'HEAD' });
      results.push({ 
        test: "HTTP Response", 
        result: `✅ ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        }
      });
    } catch (error) {
      results.push({ 
        test: "HTTP Response", 
        result: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
    
    // Test 4: Test image load
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        results.push({ 
          test: "Image Load", 
          result: `✅ Loaded (${img.width}x${img.height})`,
          details: { width: img.width, height: img.height }
        });
        setTestResults(results);
        resolve(results);
      };
      img.onerror = () => {
        results.push({ 
          test: "Image Load", 
          result: "❌ Failed to load",
          details: { error: "Image onerror event fired" }
        });
        setTestResults(results);
        resolve(results);
      };
      img.src = url;
    });
  };

  const handleTest = async () => {
    if (!imageUrl.trim()) return;
    setTestResults([]);
    await testImage(imageUrl.trim());
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Direct Image Test</h1>
        <p className="text-gray-600 mb-8">Test UploadThing image URLs directly</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Test Image URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Paste UploadThing URL here..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTest()}
            />
            <Button onClick={handleTest} disabled={!imageUrl.trim()}>
              Test
            </Button>
          </div>
          
          {imageUrl && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <strong>URL:</strong> {imageUrl}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Image Preview:</h4>
                <UploadThingImage
                  src={imageUrl}
                  alt="Test image"
                  className="w-full h-64"
                  onLoad={() => console.log("✅ Image loaded in component")}
                  onError={(e) => console.error("❌ Image failed in component:", e)}
                />
              </div>
              
              {testResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Test Results:</h4>
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Badge variant="secondary" className="w-24 text-xs">
                          {result.test}
                        </Badge>
                        <span className="text-sm">{result.result}</span>
                        {result.details && (
                          <details className="ml-auto">
                            <summary className="text-xs text-gray-500 cursor-pointer">Details</summary>
                            <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 