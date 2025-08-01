'use client';

import { CATEGORY_COLORS, getCategoryColor, getCategoryTextColor, getCategoryBgColor } from '@/lib/category-colors';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestCategoryColorsPage() {
  const categories = Object.keys(CATEGORY_COLORS);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Category Colors Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Full color class */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Full Color Class:</h3>
                <div className={cn(
                  "px-3 py-2 rounded-lg border text-sm font-medium",
                  getCategoryColor(category)
                )}>
                  {category}
                </div>
              </div>

              {/* Background only */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Background Only:</h3>
                <div className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium",
                  getCategoryBgColor(category),
                  "text-gray-800"
                )}>
                  {category}
                </div>
              </div>

              {/* Text color only */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Text Color Only:</h3>
                <div className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium bg-gray-100",
                  getCategoryTextColor(category)
                )}>
                  {category}
                </div>
              </div>

              {/* Raw class string */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Raw Class String:</h3>
                <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                  {CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}
                </code>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage examples */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Usage Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Card Style</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.slice(0, 3).map((category) => (
                <div key={category} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    📦
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Sample Product</h4>
                    <div className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full inline-block mt-1",
                      getCategoryBgColor(category),
                      getCategoryTextColor(category)
                    )}>
                      {category}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Table Style</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.slice(0, 3).map((category) => (
                <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs">
                      📦
                    </div>
                    <div>
                      <p className="font-medium text-sm">Sample Product</p>
                      <p className="text-xs text-gray-500">Product description</p>
                    </div>
                  </div>
                  <div className={cn(
                    "text-xs border px-2 py-1 rounded-full",
                    getCategoryColor(category)
                  )}>
                    {category}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 