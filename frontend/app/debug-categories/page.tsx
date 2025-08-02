'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { getCategoryColor, getCategoryTextColor, getCategoryBgColor } from '@/lib/category-colors';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCategories();
    
        setCategories(response);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Loading categories...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error: {error}</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gỡ Lỗi Danh Mục</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Danh mục thô từ API:</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {JSON.stringify(categories, null, 2)}
        </pre>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <p className="text-sm text-gray-600">ID: {category.id}</p>
              <p className="text-sm text-gray-600">Mã: {category.slug}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Full color class */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Lớp màu đầy đủ:</h3>
                <div className={cn(
                  "px-3 py-2 rounded-lg border text-sm font-medium",
                  getCategoryColor(category.name)
                )}>
                  {category.name}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Class: {getCategoryColor(category.name)}
                </p>
              </div>

              {/* Background only */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Chỉ nền:</h3>
                <div className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium",
                  getCategoryBgColor(category.name),
                  "text-gray-800"
                )}>
                  {category.name}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Class: {getCategoryBgColor(category.name)}
                </p>
              </div>

              {/* Text color only */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Chỉ màu chữ:</h3>
                <div className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium bg-gray-100",
                  getCategoryTextColor(category.name)
                )}>
                  {category.name}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Class: {getCategoryTextColor(category.name)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Kiểm tra tên danh mục:</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          {categories.map((category) => (
            <div key={category.id} className="mb-2">
              <span className="font-medium">"{category.name}"</span> - 
              <span className="ml-2 text-sm">
                {getCategoryColor(category.name) !== 'bg-gray-100 text-gray-800 border-gray-200' 
                  ? '✅ Có ánh xạ màu sắc' 
                  : '❌ Không tìm thấy ánh xạ màu sắc'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 