'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { apiService } from '@/lib/api';
import { getCategoryColor } from '@/lib/category-colors';
import { cn } from '@/lib/utils';
import { Edit, Save, X, Plus, Palette, ChevronDown } from 'lucide-react';
import type { Category } from '@/lib/types';

const COLOR_OPTIONS = [
  { 
    name: 'Xanh dương', 
    value: 'bg-blue-100 text-blue-800 border-blue-200',
    preview: 'bg-blue-500'
  },
  { 
    name: 'Xanh lá', 
    value: 'bg-green-100 text-green-800 border-green-200',
    preview: 'bg-green-500'
  },
  { 
    name: 'Tím', 
    value: 'bg-purple-100 text-purple-800 border-purple-200',
    preview: 'bg-purple-500'
  },
  { 
    name: 'Cam', 
    value: 'bg-orange-100 text-orange-800 border-orange-200',
    preview: 'bg-orange-500'
  },
  { 
    name: 'Đỏ', 
    value: 'bg-red-100 text-red-800 border-red-200',
    preview: 'bg-red-500'
  },
  { 
    name: 'Xám', 
    value: 'bg-gray-100 text-gray-800 border-gray-200',
    preview: 'bg-gray-500'
  },
  { 
    name: 'Hồng', 
    value: 'bg-pink-100 text-pink-800 border-pink-200',
    preview: 'bg-pink-500'
  },
  { 
    name: 'Chàm', 
    value: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    preview: 'bg-indigo-500'
  },
];

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingColor, setEditingColor] = useState<string>('');
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsColorDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCategories();
      setCategories(response);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh mục",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingColor(category.colorScheme || '');
  };

  const handleSave = async (categoryId: string) => {
    try {
      // Call API to update category color in database
      await apiService.updateCategoryColor(categoryId, editingColor || null);
      
      // Update local state
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, colorScheme: editingColor || undefined }
          : cat
      ));
      
      setEditingId(null);
      setEditingColor('');
      
      // Force refresh of products data by triggering a page reload
      // This ensures all components using category colors are updated
      window.location.reload();
      
      toast({
        title: "Thành công",
        description: "Màu sắc danh mục đã được cập nhật. Trang sẽ được tải lại để hiển thị thay đổi.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật màu sắc danh mục",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingColor('');
  };

  const handleReset = async (category: Category) => {
    try {
      // Call API to reset category color in database
      await apiService.updateCategoryColor(category.id, null);
      
      // Update local state
      setCategories(prev => prev.map(cat => 
        cat.id === category.id 
          ? { ...cat, colorScheme: undefined }
          : cat
      ));
      
      // Force refresh of products data by triggering a page reload
      // This ensures all components using category colors are updated
      window.location.reload();
      
      toast({
        title: "Thành công",
        description: "Màu sắc danh mục đã được đặt lại về mặc định. Trang sẽ được tải lại để hiển thị thay đổi.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể đặt lại màu sắc danh mục",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quản Lý Danh Mục</h1>
        <p className="text-gray-600">
          Quản lý màu sắc và cài đặt danh mục. Màu sắc tùy chỉnh sẽ ghi đè lên màu sắc mặc định.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pt-6">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{category.name}</span>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-gray-400" />
                  {category.colorScheme && (
                    <Badge variant="secondary" className="text-xs">
                      Tùy chỉnh
                    </Badge>
                  )}
                </div>
              </CardTitle>
              <p className="text-sm text-gray-600">Mã: {category.slug}</p>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              {/* Current Color Display */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Màu sắc hiện tại:</h3>
                <div className={cn(
                  "px-3 py-2 rounded-lg border text-sm font-medium",
                  getCategoryColor(category.name, category.colorScheme)
                )}>
                  {category.name}
                </div>
              </div>

              {/* Edit Color Section */}
              {editingId === category.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Chọn màu sắc:
                    </label>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsColorDropdownOpen(isColorDropdownOpen === category.id ? null : category.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setIsColorDropdownOpen(isColorDropdownOpen === category.id ? null : category.id);
                          }
                        }}
                        aria-haspopup="listbox"
                        aria-expanded={isColorDropdownOpen === category.id}
                        aria-label="Chọn màu sắc cho danh mục"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {editingColor ? (
                            <>
                              <div className={cn(
                                "w-4 h-4 rounded-full border border-gray-300",
                                COLOR_OPTIONS.find(c => c.value === editingColor)?.preview || 'bg-gray-500'
                              )} />
                              <span className="text-sm">
                                {COLOR_OPTIONS.find(c => c.value === editingColor)?.name || 'Tùy chỉnh'}
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-4 h-4 rounded-full border border-gray-300 bg-gradient-to-r from-gray-400 to-gray-600" />
                              <span className="text-sm text-gray-600">Mặc định (Tự động)</span>
                            </>
                          )}
                        </div>
                        <ChevronDown className={cn(
                          "w-4 h-4 text-gray-400 transition-transform",
                          isColorDropdownOpen === category.id && "rotate-180"
                        )} />
                      </button>
                      
                      {isColorDropdownOpen === category.id && (
                        <div 
                          role="listbox"
                          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
                        >
                          <div className="p-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingColor('');
                                setIsColorDropdownOpen(null);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md flex items-center gap-3 transition-colors"
                            >
                              <div className="w-4 h-4 rounded-full border border-gray-300 bg-gradient-to-r from-gray-400 to-gray-600" />
                              <span className="text-sm">Mặc định (Tự động)</span>
                            </button>
                          </div>
                          <div className="border-t border-gray-100">
                            {COLOR_OPTIONS.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => {
                                  setEditingColor(color.value);
                                  setIsColorDropdownOpen(null);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                              >
                                <div className={cn(
                                  "w-4 h-4 rounded-full border border-gray-300",
                                  color.preview
                                )} />
                                <span className="text-sm">{color.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSave(category.id)}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Lưu
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Hủy
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(category)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Chỉnh sửa màu
                  </Button>
                  {category.colorScheme && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReset(category)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Đặt lại
                    </Button>
                  )}
                </div>
              )}

              {/* Color Preview */}
              {editingId === category.id && editingColor && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Xem trước:</h3>
                  <div className={cn(
                    "px-3 py-2 rounded-lg border text-sm font-medium",
                    editingColor
                  )}>
                    {category.name}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Toaster />
    </div>
  );
} 