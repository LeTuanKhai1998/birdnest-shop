'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiService } from '@/lib/api';
import { getCategoryColor } from '@/lib/category-colors';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';

export default function TestCategoryColorsRealPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProducts();
        setProducts(response);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Test Category Colors (Real Data)</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Test Category Colors (Real Data)</h1>
      <p className="text-gray-600 mb-8">
        This page shows products with their actual category colors from the database.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <p className="text-sm text-gray-600">{product.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Badge */}
              {product.category && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Category:</h3>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs border",
                      getCategoryColor(product.category.name, product.category.colorScheme)
                    )}
                  >
                    {product.category.name}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    Color Scheme: {product.category.colorScheme || 'default'}
                  </p>
                </div>
              )}

              {/* Product Details */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Details:</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Price:</span> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(product.price))}</p>
                  <p><span className="font-medium">Weight:</span> {product.weight}g</p>
                  <p><span className="font-medium">Stock:</span> {product.quantity}</p>
                  <p><span className="font-medium">Status:</span> {product.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Total Products: {products.length}
            </p>
            <p className="text-sm text-gray-600">
              Products with custom colors: {products.filter(p => p.category?.colorScheme).length}
            </p>
            <p className="text-sm text-gray-600">
              Products with default colors: {products.filter(p => !p.category?.colorScheme).length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 