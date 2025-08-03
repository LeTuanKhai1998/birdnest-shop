'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { apiService } from '@/lib/api';
import { getCategoryColor } from '@/lib/category-colors';
import { cn } from '@/lib/utils';
import { Edit, Save, X, Plus, Palette, ChevronDown, Tag } from 'lucide-react';
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
      await apiService.updateCategoryColor(categoryId, editingColor || null);
      toast({
        title: "Thành công",
        description: "Cập nhật màu sắc danh mục thành công",
      });
      setEditingId(null);
      setEditingColor('');
      fetchCategories();
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
    setIsColorDropdownOpen(null);
  };

  const handleReset = async (category: Category) => {
    try {
      await apiService.updateCategoryColor(category.id, null);
      toast({
        title: "Thành công",
        description: "Đặt lại màu sắc danh mục thành công",
      });
      fetchCategories();
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
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-50">
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#a10000]">Quản lý danh mục</h1>
              <p className="text-gray-600">Cập nhật màu sắc và thông tin danh mục sản phẩm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories List Section */}
      <div>
        <h2 className="text-2xl font-bold text-[#a10000] mb-6">
          Danh sách danh mục
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-4 sm:p-6">
                {/* Header with status */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#a10000] rounded-lg">
                      <Palette className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#a10000]">{category.name}</h3>
                      <p className="text-sm text-gray-600">Mã: {category.slug}</p>
                    </div>
                  </div>
                  {category.colorScheme && (
                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                      Tùy chỉnh
                    </Badge>
                  )}
                </div>

                {/* Current Color Display */}
                <Card className="hover:shadow-lg transition-shadow duration-200 mb-4">
                  <CardHeader className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Tag className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2 text-[#a10000] text-sm">
                          Màu sắc hiện tại
                          <Badge variant="secondary" className="text-xs">Thông tin</Badge>
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className={cn(
                      "px-3 py-2 rounded-lg border text-sm font-medium",
                      getCategoryColor(category.name, category.colorScheme)
                    )}>
                      {category.name}
                    </div>
                  </CardContent>
                </Card>

                {/* Edit Color Section */}
                {editingId === category.id ? (
                  <Card className="hover:shadow-lg transition-shadow duration-200 mb-4">
                    <CardHeader className="pt-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Palette className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2 text-[#a10000] text-sm">
                            Chọn màu sắc
                            <Badge variant="secondary" className="text-xs">Tùy chọn</Badge>
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
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
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleSave(category.id)}
                            className="flex-1 bg-[#a10000] hover:bg-[#c41e3a] text-white"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Lưu
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Hủy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="hover:shadow-lg transition-shadow duration-200 mb-4">
                    <CardContent className="pb-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(category)}
                          className="flex-1 border-[#a10000] text-[#a10000] hover:bg-[#a10000] hover:text-white"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Chỉnh sửa màu
                        </Button>
                        {category.colorScheme && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReset(category)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Đặt lại
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Color Preview */}
                {editingId === category.id && editingColor && (
                  <Card className="hover:shadow-lg transition-shadow duration-200 mb-4">
                    <CardHeader className="pt-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Tag className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2 text-[#a10000] text-sm">
                            Xem trước
                            <Badge variant="secondary" className="text-xs">Tùy chọn</Badge>
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className={cn(
                        "px-3 py-2 rounded-lg border text-sm font-medium",
                        editingColor
                      )}>
                        {category.name}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Toaster />
    </div>
  );
} 