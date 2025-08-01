'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState, useMemo, useEffect } from 'react';
import { 
  Trash2, 
  Plus, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Package,
  Edit,
  Image as ImageIcon,
  Star,
  DollarSign,
  Hash,
  X,
  Save,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useRef } from 'react';
import { AdminTable } from '@/components/ui/AdminTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import useSWR, { mutate as globalMutate } from 'swr';
import { apiService } from '@/lib/api';
import type { Product } from '@/lib/types';
import { getFirstImageUrl, cn } from '@/lib/utils';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageUpload } from '@/components/ui/ImageUpload';
import type { ProductImage } from '@/lib/types';
import { getCategoryColor } from '@/lib/category-colors';

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
  weight: z
    .string()
    .min(1, 'Trọng lượng là bắt buộc')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Trọng lượng phải là số dương',
    }),
  discount: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100), {
      message: 'Giảm giá phải là số từ 0-100%',
    }),
  isActive: z.boolean().optional(),
});

const filterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;
type FilterForm = z.infer<typeof filterSchema>;

// Categories will be loaded from database
const CATEGORIES: string[] = [];

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
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [detailedProduct, setDetailedProduct] = useState<Product | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [images, setImages] = useState<{ url: string; isPrimary?: boolean }[]>([]);
  const [cacheKey, setCacheKey] = useState<string>(`admin-products-${Date.now()}`);
  const [statsCacheKey, setStatsCacheKey] = useState<string>(`admin-product-stats-${Date.now()}`);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting state
  const [sortField, setSortField] = useState<'price' | 'quantity' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  const { data: products, isLoading, mutate } = useSWR(cacheKey, () => apiService.getProducts(), {
    refreshInterval: 0, // Disable auto-refresh
    revalidateOnFocus: false, // Disable revalidation on focus
  });
  const { data: productStats, isLoading: statsLoading } = useSWR(statsCacheKey, () => apiService.getProductStats(), {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });
  


  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories();
        setCategories(response);
        // Update the global CATEGORIES array with actual category names
        CATEGORIES.length = 0; // Clear array
        response.forEach((cat: any) => CATEGORIES.push(cat.name));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Handle sorting
  const handleSort = (field: 'price' | 'quantity') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: 'price' | 'quantity') => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let filtered = products.filter((product: Product) => {
      const matchesSearch = !searchValue || 
        product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        product.description.toLowerCase().includes(searchValue.toLowerCase());
      const matchesCategory = !categoryFilter || product.category?.name === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    // Apply sorting
    if (sortField) {
      filtered.sort((a: Product, b: Product) => {
        let aValue: number, bValue: number;
        
        if (sortField === 'price') {
          aValue = parseFloat(a.price) || 0;
          bValue = parseFloat(b.price) || 0;
        } else {
          aValue = a.quantity || 0;
          bValue = b.quantity || 0;
        }

        if (sortDirection === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }

    return filtered;
  }, [products, searchValue, categoryFilter, sortField, sortDirection]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, categoryFilter]);

  // Pagination logic
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const totalItems = filteredProducts.length;

  // Calculate metrics from real API data
  const metrics = useMemo(() => {
    if (!productStats) return null;
    return {
      totalProducts: productStats.totalProducts,
      lowStock: productStats.lowStock,
      outOfStock: productStats.outOfStock,
      totalValue: parseFloat(productStats.totalValue),
      totalProductsTrend: productStats.totalProductsTrend,
      totalValueTrend: productStats.totalValueTrend,
    };
  }, [productStats]);

  const onSubmit = async (data: ProductForm) => {
    try {
      setLoading(true);
      
      if (editId) {
        await apiService.updateProduct(editId, {
          ...data,
          price: data.price,
          quantity: parseInt(data.stock),
          categoryId: data.categoryId,
          weight: parseFloat(data.weight),
          discount: data.discount ? parseFloat(data.discount) : 0,
          isActive: data.isActive,
          images: images.map(img => ({ url: img.url, isPrimary: img.isPrimary || false })),
        });
        toast({
          title: "Sản phẩm đã cập nhật",
          description: "Sản phẩm đã được cập nhật thành công",
          variant: "success",
        });
      } else {
        await apiService.createProduct({
          ...data,
          price: data.price,
          quantity: parseInt(data.stock),
          categoryId: data.categoryId,
          weight: parseFloat(data.weight),
          discount: data.discount ? parseFloat(data.discount) : 0,
          isActive: data.isActive,
          slug: data.name.toLowerCase().replace(/\s+/g, '-'),
          images: images.map(img => ({ url: img.url, isPrimary: img.isPrimary || false })),
        });
        toast({
          title: "Sản phẩm đã tạo",
          description: "Sản phẩm mới đã được tạo thành công",
          variant: "success",
        });
      }
      
      await mutate();
      setDialogOpen(false);
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

  const handleEdit = async (product: Product) => {
    setEditId(product.id);
    setDialogOpen(true);
    setLoadingProduct(true);
    
    // Fetch detailed product data from backend
    try {
      const detailedProduct = await apiService.getProduct(product.id);
      
      // Populate form with detailed data
      setValue('name', detailedProduct.name);
      setValue('description', detailedProduct.description);
      setValue('price', detailedProduct.price);
      setValue('stock', detailedProduct.quantity?.toString() || '0');
      setValue('categoryId', detailedProduct.categoryId || '');
      setValue('weight', detailedProduct.weight?.toString() || '');
      setValue('discount', detailedProduct.discount?.toString() || '');
      setValue('isActive', detailedProduct.isActive ?? true);
      
      // Set images with proper formatting
      if (detailedProduct.images && detailedProduct.images.length > 0) {
        const formattedImages = detailedProduct.images.map((img: any) => ({
          url: typeof img === 'string' ? img : img.url,
          isPrimary: typeof img === 'string' ? false : img.isPrimary || false,
        }));
        setImages(formattedImages);
      } else {
        setImages([]);
      }
      
      toast({
        title: "Sản phẩm đã tải",
        description: "Thông tin sản phẩm đã được tải thành công",
        variant: "success",
      });
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin sản phẩm. Vui lòng thử lại.",
        variant: "destructive",
      });
      
      // Fallback to basic product data
      setImages(
        product.images?.map((img: string | ProductImage) => {
          if (typeof img === 'string') {
            return { url: img, isPrimary: false };
          } else {
            return { url: (img as ProductImage).url, isPrimary: (img as ProductImage).isPrimary };
          }
        }) || []
      );
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setImages([]);
    setDialogOpen(false);
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

  const handleToggleActive = async (product: Product) => {
    // If activating, proceed immediately
    if (!product.isActive) {
      try {
        await apiService.updateProduct(product.id, {
          isActive: true,
        });
        
        await mutate();
        
        toast({
          title: "Sản phẩm đã kích hoạt",
          description: "Sản phẩm đã được kích hoạt thành công và sẽ hiển thị cho khách hàng",
          variant: "success",
        });
      } catch (error) {
        console.error('Error activating product:', error);
        toast({
          title: "Lỗi",
          description: "Không thể kích hoạt sản phẩm. Vui lòng thử lại.",
          variant: "destructive",
        });
      }
    } else {
      // If deactivating, show confirmation dialog
      setDeactivateId(product.id);
      setDeactivateDialogOpen(true);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateId) return;
    
    try {
      await apiService.updateProduct(deactivateId, {
        isActive: false,
      });
      
      await mutate();
      
      toast({
        title: "Sản phẩm đã vô hiệu hóa",
        description: "Sản phẩm đã được vô hiệu hóa thành công và sẽ không hiển thị cho khách hàng",
        variant: "success",
      });
    } catch (error) {
      console.error('Error deactivating product:', error);
      toast({
        title: "Lỗi",
        description: "Không thể vô hiệu hóa sản phẩm. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setDeactivateDialogOpen(false);
      setDeactivateId(null);
    }
  };

  const handleCancelDeactivate = () => {
    setDeactivateDialogOpen(false);
    setDeactivateId(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Clear all SWR cache and force revalidation
      await globalMutate(() => true, undefined, { revalidate: true });
      
      // Also clear specific keys
      await Promise.all([
        mutate(undefined, { revalidate: true }),
        globalMutate('admin-product-stats', undefined, { revalidate: true })
      ]);
      
      // Force a small delay to ensure cache is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Update cache keys to force fresh data fetch
      setCacheKey(`admin-products-${Date.now()}`);
      setStatsCacheKey(`admin-product-stats-${Date.now()}`);
      
    } catch (error) {
      // Error handling for refresh operation
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading || statsLoading) {
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
    <div>
      {/* View Mode Toggle and Actions */}
      <div className="flex items-center justify-end gap-3 mb-6">
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>

        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalProducts}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">0.0%</span>
                    <span className="text-sm text-gray-500">so với tháng trước</span>
                  </div>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-4.8 h-4.8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Tồn kho thấp</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.lowStock}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-600">Cần chú ý</span>
                  </div>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-4.8 h-4.8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Hết hàng</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.outOfStock}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Hash className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">Cần bổ sung</span>
                  </div>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <Hash className="w-4.8 h-4.8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Tổng giá trị</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(metrics.totalValue)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">0.0%</span>
                    <span className="text-sm text-gray-500">so với tháng trước</span>
                  </div>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-4.8 h-4.8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader className="pt-6">
          <CardTitle>Danh sách sản phẩm</CardTitle>
          <CardDescription>
            Xem và quản lý tất cả sản phẩm trong cửa hàng
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có sản phẩm</h3>
              <p className="text-gray-600 mb-4">Bắt đầu bằng cách thêm sản phẩm đầu tiên.</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm sản phẩm
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-gray-700">Sản phẩm</th>
                    <th className="text-left p-4 font-medium text-gray-700">Danh mục</th>
                    <th className="text-left p-4 font-medium text-gray-700">
                      <button
                        onClick={() => handleSort('price')}
                        className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                      >
                        Giá
                        {getSortIcon('price')}
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium text-gray-700">
                      <button
                        onClick={() => handleSort('quantity')}
                        className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                      >
                        Tồn kho
                        {getSortIcon('quantity')}
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium text-gray-700">Trạng thái</th>
                    <th className="text-right p-4 font-medium text-gray-700 whitespace-nowrap">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product: Product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Image
                              src={getFirstImageUrl(product.images) || FALLBACK_IMAGE}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-32">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs border",
                            getCategoryColor(product.category?.name, product.category?.colorScheme)
                          )}
                        >
                          {product.category?.name || 'N/A'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-sm">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(product.price))}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{product.quantity || 0}</span>
                          {(product.quantity || 0) < 10 && (
                            <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                              Low
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <StatusBadge 
                          status={product.isActive ? 'ACTIVE' : 'INACTIVE'} 
                        />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(product)}
                            className={cn(
                              "whitespace-nowrap transition-all duration-200 font-medium",
                              product.isActive 
                                ? "text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300" 
                                : "text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 hover:border-green-300"
                            )}
                            title={product.isActive ? "Vô hiệu hóa sản phẩm" : "Kích hoạt sản phẩm"}
                          >
                            {product.isActive ? (
                              <>
                                <X className="w-4 h-4 mr-1.5" />
                                Vô hiệu hóa
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                Kích hoạt
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Enhanced Pagination Controls - Inside Card */}
          {totalItems > 0 && (
            <div className="mt-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Page Info */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    Hiển thị <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> - <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> trong tổng số <span className="font-medium">{totalItems}</span> sản phẩm
                  </span>
                  
                  {/* Page Size Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Hiển thị:</span>
                    <select 
                      value={pageSize} 
                      onChange={(e) => {
                        setPageSize(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="w-16 h-8 text-sm border border-gray-300 rounded px-2"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
                
                {/* Enhanced Pagination Navigation */}
                <div className="flex items-center gap-1">
                  {/* First Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                    title="Trang đầu"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  
                  {/* Previous Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {/* Page Numbers with Ellipsis */}
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages = [];
                      const maxVisible = 5;
                      
                      if (totalPages <= maxVisible) {
                        // Show all pages if total is small
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(
                            <Button
                              key={i}
                              variant={currentPage === i ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(i)}
                              className="h-8 w-8 p-0 text-sm font-medium"
                            >
                              {i}
                            </Button>
                          );
                        }
                      } else {
                        // Show smart pagination with ellipsis
                        if (currentPage <= 3) {
                          // Near start
                          for (let i = 1; i <= 4; i++) {
                            pages.push(
                              <Button
                                key={i}
                                variant={currentPage === i ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(i)}
                                className="h-8 w-8 p-0 text-sm font-medium"
                              >
                                {i}
                              </Button>
                            );
                          }
                          pages.push(
                            <span key="ellipsis1" className="px-2 text-gray-400">...</span>
                          );
                          pages.push(
                            <Button
                              key={totalPages}
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(totalPages)}
                              className="h-8 w-8 p-0 text-sm font-medium"
                            >
                              {totalPages}
                            </Button>
                          );
                        } else if (currentPage >= totalPages - 2) {
                          // Near end
                          pages.push(
                            <Button
                              key={1}
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(1)}
                              className="h-8 w-8 p-0 text-sm font-medium"
                            >
                              1
                            </Button>
                          );
                          pages.push(
                            <span key="ellipsis2" className="px-2 text-gray-400">...</span>
                          );
                          for (let i = totalPages - 3; i <= totalPages; i++) {
                            pages.push(
                              <Button
                                key={i}
                                variant={currentPage === i ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(i)}
                                className="h-8 w-8 p-0 text-sm font-medium"
                              >
                                {i}
                              </Button>
                            );
                          }
                        } else {
                          // Middle
                          pages.push(
                            <Button
                              key={1}
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(1)}
                              className="h-8 w-8 p-0 text-sm font-medium"
                            >
                              1
                            </Button>
                          );
                          pages.push(
                            <span key="ellipsis3" className="px-2 text-gray-400">...</span>
                          );
                          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                            pages.push(
                              <Button
                                key={i}
                                variant={currentPage === i ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(i)}
                                className="h-8 w-8 p-0 text-sm font-medium"
                              >
                                {i}
                              </Button>
                            );
                          }
                          pages.push(
                            <span key="ellipsis4" className="px-2 text-gray-400">...</span>
                          );
                          pages.push(
                            <Button
                              key={totalPages}
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(totalPages)}
                              className="h-8 w-8 p-0 text-sm font-medium"
                            >
                              {totalPages}
                            </Button>
                          );
                        }
                      }
                      
                      return pages;
                    })()}
                  </div>
                  
                  {/* Next Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                    title="Trang tiếp"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  {/* Last Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                    title="Trang cuối"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Product Form Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {editId ? (
                      <Edit className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      {editId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </h2>
                    <p className="text-white font-medium">
                      {editId ? 'Cập nhật thông tin sản phẩm hiện có' : 'Thêm sản phẩm mới vào hệ thống'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDialogOpen(false)}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
                        </div>
            
            {/* Content */}
            <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
            {loadingProduct ? (
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-6 w-16" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Card>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-32 mb-4" />
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-3 w-2/3" />
                            </div>
                            <Skeleton className="h-4 w-16" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Product Images Section */}
                <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                  <CardHeader className="pt-4">
                    <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      Hình ảnh sản phẩm
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ImageUpload
                      endpoint="productImageUploader"
                      onUpload={(urls) => {
                        const newImages = urls.map((url, index) => ({
                          url,
                          isPrimary: images.length === 0 && index === 0,
                        }));
                        setImages(prev => [...prev, ...newImages]);
                      }}
                      maxFiles={10}
                      maxSize={4}
                      showPreview={true}
                      className="mb-4"
                    />
                  
                    {/* Image Preview */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.url}
                              alt={`Product image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleSetPrimary(image.url)}
                                  disabled={image.isPrimary}
                                >
                                  <Star className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleRemoveImage(image.url)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            {image.isPrimary && (
                              <div className="absolute top-1 left-1">
                                <Badge className="text-xs bg-primary text-primary-foreground">
                                  Primary
                                </Badge>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Basic Information */}
                <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                  <CardHeader className="pt-4">
                    <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Package className="w-4 h-4 text-green-600" />
                      Thông tin cơ bản
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-6">
                    {/* Product Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700">
                        Tên sản phẩm
                      </label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="Nhập tên sản phẩm"
                        className="w-full"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium mb-2 text-gray-700">
                        Mô tả
                      </label>
                      <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="Nhập mô tả sản phẩm"
                        rows={4}
                        className="w-full"
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium mb-2 text-gray-700">
                        Danh mục
                      </label>
                      <select
                        id="category"
                        {...register('categoryId')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.categoryId && (
                        <p className="text-sm text-red-600 mt-1">{errors.categoryId.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing and Inventory */}
                <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                  <CardHeader className="pt-4">
                    <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-purple-600" />
                      Giá cả và tồn kho
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-6">
                    {/* Price and Stock */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium mb-2 text-gray-700">
                          Giá (VND)
                        </label>
                        <Input
                          id="price"
                          {...register('price')}
                          placeholder="100000"
                          className="w-full"
                        />
                        {errors.price && (
                          <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="stock" className="block text-sm font-medium mb-2 text-gray-700">
                          Số lượng tồn kho
                        </label>
                        <Input
                          id="stock"
                          {...register('stock')}
                          placeholder="10"
                          className="w-full"
                        />
                        {errors.stock && (
                          <p className="text-sm text-red-600 mt-1">{errors.stock.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Weight and Discount */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="weight" className="block text-sm font-medium mb-2 text-gray-700">
                          Trọng lượng (g)
                        </label>
                        <Input
                          id="weight"
                          {...register('weight')}
                          placeholder="100"
                          className="w-full"
                        />
                        {errors.weight && (
                          <p className="text-sm text-red-600 mt-1">{errors.weight.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="discount" className="block text-sm font-medium mb-2 text-gray-700">
                          Giảm giá (%)
                        </label>
                        <Input
                          id="discount"
                          {...register('discount')}
                          placeholder="0"
                          className="w-full"
                        />
                        {errors.discount && (
                          <p className="text-sm text-red-600 mt-1">{errors.discount.message}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Status and Actions */}
                <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                  <CardHeader className="pt-4">
                    <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                      Trạng thái và hành động
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-6">
                    {/* Active Status */}
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...register('isActive')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Sản phẩm đang hoạt động</span>
                      </label>
                      {errors.isActive && (
                        <p className="text-sm text-red-600 mt-1">{errors.isActive.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Xóa sản phẩm</h2>
              <Button variant="ghost" size="sm" onClick={() => setDeleteId(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelDelete}>
                Hủy
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivation Confirmation Dialog */}
      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <h2 className="flex items-center gap-2 text-red-600">
              <X className="w-5 h-5" />
              Vô hiệu hóa sản phẩm
            </h2>
            <p className="text-gray-600">
              Bạn có chắc chắn muốn vô hiệu hóa sản phẩm này? Sản phẩm sẽ không hiển thị cho khách hàng và không thể mua được. Bạn có thể kích hoạt lại bất cứ lúc nào.
            </p>
          </DialogHeader>
          
          <div className="flex items-start gap-3 py-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Bạn có chắc chắn muốn vô hiệu hóa sản phẩm này?
              </p>
              <p className="text-sm text-gray-600">
                Sản phẩm sẽ không hiển thị cho khách hàng và không thể mua được. Bạn có thể kích hoạt lại bất cứ lúc nào.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleCancelDeactivate}>
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDeactivate}
              className="bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
            >
              <X className="w-4 h-4 mr-2" />
              Vô hiệu hóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
