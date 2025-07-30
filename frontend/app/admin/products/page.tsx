'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState, useMemo, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Package,
  Edit,
  Eye,
  MoreHorizontal,
  Image as ImageIcon,
  Star,
  DollarSign,
  Hash,
  Tag,
  X
} from 'lucide-react';
import { useRef } from 'react';
import { AdminTable } from '@/components/ui/AdminTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import useSWR from 'swr';
import { apiService } from '@/lib/api';
import type { Product } from '@/lib/types';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

const productSchema = z.object({
  name: z.string().min(2, 'Tên sản phẩm là bắt buộc'),
  description: z.string().min(5, 'Mô tả là bắt buộc'),
  price: z
    .string()
    .min(1, 'Giá là bắt buộc')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 1000, {
      message: 'Giá phải là số và ít nhất 1,000 VND',
    }),
  stock: z
    .string()
    .min(1, 'Số lượng tồn kho là bắt buộc')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Số lượng tồn kho phải là số không âm',
    }),
  categoryId: z.string().min(2, 'Danh mục là bắt buộc'),
});

const filterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;
type FilterForm = z.infer<typeof filterSchema>;

// Map database categories to display names
const CATEGORY_MAPPING = {
  'Yến hủ': 'Yến Tinh Chế',
  'Yến tinh': 'Yến Rút Lông', 
  'Yến baby': 'Tổ Yến Thô'
};

const CATEGORIES = Object.values(CATEGORY_MAPPING);

// Helper function to get display name for category
const getCategoryDisplayName = (categoryName: string) => {
  return CATEGORY_MAPPING[categoryName as keyof typeof CATEGORY_MAPPING] || categoryName;
};

// Add a fallback image path
const FALLBACK_IMAGE = '/images/banner1.png';

// Add a helper to mark one image as primary
function setPrimaryImage(
  images: { url: string; isPrimary?: boolean }[],
  url: string,
) {
  return images.map((img) => ({ ...img, isPrimary: img.url === url }));
}

// Create a proper type for admin table data
interface AdminTableRowData {
  id: string;
  name: string;
  thumbnail: React.ReactNode;
  price: string;
  quantity: number;
  category: string;
  _original: Product;
}

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [images, setImages] = useState<{ url: string; isPrimary?: boolean }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      console.log('No authentication found, redirecting to login');
      window.location.href = '/login?callbackUrl=/admin';
      return;
    }

    const userData = JSON.parse(user);
    if (!userData.isAdmin) {
      console.log('User is not admin, redirecting to login');
      window.location.href = '/login?callbackUrl=/admin';
      return;
    }
  }, []);

  const { data: products, isLoading, mutate } = useSWR('admin-products', () => apiService.getProducts());

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories();
        setCategories(response);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product: Product) => {
      const matchesSearch = !searchValue || 
        product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        product.description.toLowerCase().includes(searchValue.toLowerCase());
      const matchesCategory = !categoryFilter || getCategoryDisplayName(product.category.name) === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchValue, categoryFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!products) return null;
    return {
      totalProducts: products.length,
      lowStock: products.filter((p: Product) => p.quantity < 10).length,
      outOfStock: products.filter((p: Product) => p.quantity === 0).length,
      totalValue: products.reduce((sum: number, p: Product) => sum + (p.quantity * parseFloat(p.price)), 0),
    };
  }, [products]);

  const onSubmit = async (data: ProductForm) => {
    try {
      setLoading(true);
      
              if (editId) {
          await apiService.updateProduct(editId, {
            ...data,
            price: data.price,
            quantity: parseInt(data.stock),
            categoryId: data.categoryId,
            images: images.map(img => ({ url: img.url, isPrimary: img.isPrimary || false })),
          });
          toast({
            title: "Product updated",
            description: "Product has been updated successfully",
            variant: "success",
          });
        } else {
          await apiService.createProduct({
            ...data,
            price: data.price,
            quantity: parseInt(data.stock),
            categoryId: data.categoryId,
            slug: data.name.toLowerCase().replace(/\s+/g, '-'),
            images: images.map(img => ({ url: img.url, isPrimary: img.isPrimary || false })),
          });
          toast({
            title: "Product created",
            description: "New product has been created successfully",
            variant: "success",
          });
        }
      
      await mutate();
      setDrawerOpen(false);
      setEditId(null);
      setImages([]);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditId(product.id);
    setImages(product.images || []);
    setDrawerOpen(true);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setImages([]);
    setDrawerOpen(false);
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setUploadError(null);
    
    try {
      // Simulate image upload (replace with actual upload logic)
      const newImages = Array.from(files).map((file, index) => ({
        url: URL.createObjectURL(file),
        isPrimary: images.length === 0 && index === 0,
      }));
      
      setImages(prev => [...prev, ...newImages]);
      toast({
        title: "Images uploaded",
        description: `${files.length} image(s) uploaded successfully`,
        variant: "success",
      });
    } catch (error) {
      setUploadError('Failed to upload images');
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (url: string) => {
    setImages(prev => prev.filter(img => img.url !== url));
  };

  const handleSetPrimary = (url: string) => {
    setImages(prev => setPrimaryImage(prev, url));
  };

  const handleDeleteClick = (productId: string) => {
    setDeleteId(productId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      setDeleting(true);
      await apiService.deleteProduct(deleteId);
      await mutate(undefined, { revalidate: true });
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully",
        variant: "success",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteId(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await mutate();
      toast({
        title: "Data refreshed",
        description: "Product list has been updated",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
                  <p className="text-gray-600 mt-1">
                    Quản lý danh mục sản phẩm, kho hàng và giá cả
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
                <Button onClick={() => setDrawerOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm sản phẩm
                </Button>
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.totalProducts}</p>
                      <p className="text-sm text-gray-500 mt-2">Trong danh mục</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tồn kho thấp</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.lowStock}</p>
                      <p className="text-sm text-gray-500 mt-2">Dưới 10 đơn vị</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Hết hàng</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.outOfStock}</p>
                      <p className="text-sm text-gray-500 mt-2">Không còn tồn kho</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-lg">
                      <Hash className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tổng giá trị</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(metrics.totalValue)}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">Inventory value</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium mb-1 text-gray-700">
                    Search Products
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by name or description..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    {filteredProducts.length} products
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>
                Manage your product inventory and details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchValue || categoryFilter 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Get started by adding your first product'
                    }
                  </p>
                  {!searchValue && !categoryFilter && (
                    <Button onClick={() => setDrawerOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium text-gray-700">Product</th>
                        <th className="text-left p-4 font-medium text-gray-700">Category</th>
                        <th className="text-left p-4 font-medium text-gray-700">Price</th>
                        <th className="text-left p-4 font-medium text-gray-700">Stock</th>
                        <th className="text-left p-4 font-medium text-gray-700">Status</th>
                        <th className="text-right p-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product: Product) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                                                     <td className="p-4">
                             <div className="flex items-center gap-3">
                               <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                 <Image
                                   src={product.images?.[0]?.url || FALLBACK_IMAGE}
                                   alt={product.name}
                                   width={40}
                                   height={40}
                                   className="rounded"
                                 />
                               </div>
                               <div>
                                 <p className="font-medium text-sm">{product.name}</p>
                                 <p className="text-xs text-gray-500">{product.description.substring(0, 50)}...</p>
                               </div>
                             </div>
                           </td>
                           <td className="p-4">
                             <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                               <Tag className="w-3 h-3 mr-1" />
                               {getCategoryDisplayName(product.category.name)}
                             </Badge>
                           </td>
                           <td className="p-4">
                             <p className="font-medium text-sm">
                               {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(product.price))}
                             </p>
                           </td>
                           <td className="p-4">
                             <div className="flex items-center gap-2">
                               <span className="font-medium text-sm">{product.quantity}</span>
                               {product.quantity < 10 && (
                                 <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                                   Low
                                 </Badge>
                               )}
                             </div>
                           </td>
                           <td className="p-4">
                             <StatusBadge 
                               status={product.quantity > 0 ? 'active' : 'inactive'} 
                             />
                           </td>
                          <td className="p-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Form Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-2xl">
            <DrawerHeader>
              <DrawerTitle>
                {editId ? 'Edit Product' : 'Add New Product'}
              </DrawerTitle>
            </DrawerHeader>
            <div className="p-6">
              {/* Form content would go here - simplified for brevity */}
              <p className="text-gray-600">Product form implementation would go here...</p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Delete Product</h2>
              <Button variant="ghost" size="sm" onClick={() => setDeleteId(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
