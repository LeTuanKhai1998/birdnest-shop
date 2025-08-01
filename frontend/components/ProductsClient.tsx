'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { PRODUCTS_CONSTANTS } from '@/lib/constants';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiService } from '@/lib/api';
import { getCategoryTextColor, getCategoryBgColor } from '@/lib/category-colors';
import { cn } from '@/lib/utils';

export default function ProductsClient({ products }: { products: Product[] }) {
  const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });
  
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string; colorScheme?: string }>>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedWeights, setSelectedWeights] = useState<number[]>([]);
  const [price, setPrice] = useState<number>(PRODUCTS_CONSTANTS.filters.priceRange.max);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<string[]>(['type']);

  // Fetch categories on component mount
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

  // Filtering logic
  const filteredProducts = products.filter((product) => {
    // Filter by type (Loại Yến) - use the type field from the product
    const typeMatch =
      selectedCategories.length === 0 || 
      (product.type && selectedCategories.includes(product.type));
    const weightMatch =
      selectedWeights.length === 0 || selectedWeights.includes(product.weight);
    const priceMatch = parseFloat(product.price) <= price;
    const searchMatch =
      !search ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase()) ||
      (product.category?.name
        ? product.category.name.toLowerCase().includes(search.toLowerCase())
        : false) ||
      product.weight.toString().includes(search);
    return typeMatch && weightMatch && priceMatch && searchMatch;
  });

  // Pagination logic
  const totalPages =
    Math.ceil(filteredProducts.length / PRODUCTS_CONSTANTS.pagination.itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_CONSTANTS.pagination.itemsPerPage,
    currentPage * PRODUCTS_CONSTANTS.pagination.itemsPerPage,
  );

  // Handlers
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId],
    );
    setCurrentPage(1);
  };
  
  const handleWeightChange = (weight: number) => {
    setSelectedWeights((prev) =>
      prev.includes(weight)
        ? prev.filter((w) => w !== weight)
        : [...prev, weight],
    );
    setCurrentPage(1);
  };
  
  const handlePriceChange = (value: number[]) => {
    setPrice(value[0]);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };
  
  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };
  
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedWeights([]);
    setPrice(PRODUCTS_CONSTANTS.filters.priceRange.max);
    setSearch('');
    setCurrentPage(1);
  };

  const toggleFilter = (filterName: string) => {
    setExpandedFilters((prev) =>
      prev.includes(filterName)
        ? prev.filter((f) => f !== filterName)
        : [...prev, filterName]
    );
  };

  const FilterContent = (
    <div className="space-y-8">
      <div className="text-center pb-6 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-[#a10000] mb-2">
          {PRODUCTS_CONSTANTS.filters.title}
        </h3>
        <p className="text-sm text-gray-600">Tìm kiếm sản phẩm phù hợp</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetFilters}
          className="mt-4 text-sm text-gray-600 hover:text-[#a10000] hover:bg-red-50 rounded-full px-4 py-2 transition-all duration-200"
        >
          <X className="w-4 h-4 mr-2" />
          Xóa tất cả bộ lọc
        </Button>
      </div>

      {/* Type Filter */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
        <button
          onClick={() => toggleFilter('type')}
          className="flex items-center justify-between w-full text-left font-semibold text-[#a10000] mb-4 text-lg"
        >
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#a10000] rounded-full"></div>
            Loại Yến
          </span>
          <ChevronDown 
            className={`w-5 h-5 transition-transform duration-200 ${
              expandedFilters.includes('type') ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedFilters.includes('type') && (
          <div className="space-y-3">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-3 cursor-pointer hover:bg-white/60 p-3 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200"
              >
                <Checkbox
                  checked={selectedCategories.includes(category.name)}
                  onCheckedChange={() => handleCategoryChange(category.name)}
                />
                <span className={cn(
                  "text-sm font-medium px-2 py-1 rounded-full",
                  getCategoryBgColor(category.name, category.colorScheme),
                  getCategoryTextColor(category.name, category.colorScheme)
                )}>
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Weight Filter */}
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100">
        <button
          onClick={() => toggleFilter('weight')}
          className="flex items-center justify-between w-full text-left font-semibold text-[#a10000] mb-4 text-lg"
        >
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Trọng Lượng
          </span>
          <ChevronDown 
            className={`w-5 h-5 transition-transform duration-200 ${
              expandedFilters.includes('weight') ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedFilters.includes('weight') && (
          <div className="space-y-3">
            {PRODUCTS_CONSTANTS.filters.weights.map((weight) => (
              <label
                key={weight.value}
                className="flex items-center gap-3 cursor-pointer hover:bg-white/60 p-3 rounded-xl transition-all duration-200 border border-transparent hover:border-orange-200"
              >
                <Checkbox
                  checked={selectedWeights.includes(weight.value)}
                  onCheckedChange={() => handleWeightChange(weight.value)}
                  // id={`weight-${weight.value}`}
                />
                <span className="text-sm font-medium text-gray-800">{weight.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
        <button
          onClick={() => toggleFilter('price')}
          className="flex items-center justify-between w-full text-left font-semibold text-[#a10000] mb-4 text-lg"
        >
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Giá Tiền
          </span>
          <ChevronDown 
            className={`w-5 h-5 transition-transform duration-200 ${
              expandedFilters.includes('price') ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedFilters.includes('price') && (
          <div className="space-y-6">
            <div className="bg-white/60 rounded-xl p-4 border border-green-200">
              <Slider
                min={PRODUCTS_CONSTANTS.filters.priceRange.min}
                max={PRODUCTS_CONSTANTS.filters.priceRange.max}
                value={[price]}
                onValueChange={handlePriceChange}
                step={PRODUCTS_CONSTANTS.filters.priceRange.step}
              />
            </div>
            <div className="flex justify-between items-center bg-white/80 rounded-xl p-4 border border-green-200">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Từ</div>
                <div className="text-sm font-semibold text-gray-700">0₫</div>
              </div>
              <div className="w-px h-8 bg-green-200"></div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Đến</div>
                <div className="text-lg font-bold text-[#a10000]">
                  {currencyFormatter.format(price)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const resultSummary = (
    <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="text-center lg:text-left">
          <div className="text-2xl font-bold text-[#a10000] mb-1">
            {filteredProducts.length}
          </div>
          <div className="text-sm text-gray-600">
            sản phẩm được tìm thấy
            {search && (
              <>
                {' '}cho <span className="font-semibold text-gray-900 bg-yellow-100 px-2 py-1 rounded-full">&quot;{search}&quot;</span>
              </>
            )}
          </div>
        </div>
        
        {/* Search Input and Filter Button */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-md w-full mx-auto lg:mx-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm yến sào..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 border-2 border-gray-200 focus:border-[#a10000] focus:ring-[#a10000] rounded-xl text-base shadow-sm transition-all duration-200"
            />
          </div>
          
          {/* Filter Button - Mobile and Tablet */}
          <div className="lg:hidden">
            <Drawer>
              <DrawerTrigger>
                <div 
                  className="w-full py-3 px-4 text-base border border-[#a10000] text-[#a10000] hover:bg-[#a10000] hover:text-white transition-colors cursor-pointer flex items-center justify-center rounded-md"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Bộ lọc
                </div>
              </DrawerTrigger>
              <DrawerContent className="max-w-sm mx-auto rounded-t-lg">
                <DrawerHeader className="border-b border-gray-200">
                  <div className="text-[#a10000] font-semibold text-lg">
                    Bộ Lọc Sản Phẩm
                  </div>
                </DrawerHeader>
                <div className="p-6 pb-8 max-h-[70vh] overflow-y-auto">
                  {FilterContent}
                </div>
                <DrawerClose>
                  <Button 
                    variant="outline" 
                    className="w-full mb-4 py-3 text-base border-[#a10000] text-[#a10000] hover:bg-[#a10000] hover:text-white transition-colors"
                  >
                    Đóng
                  </Button>
                </DrawerClose>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white">
      {/* Page Header - Full width like Home page */}
        <section
          className="relative w-full bg-[#a10000] overflow-hidden lg:bg-[#a10000] bg-gradient-to-b from-[#a10000] to-[#fbd8b0]"
          style={{ minHeight: '600px' }}
        >
          {/* Background Image - Desktop */}
          <Image
            src="/images/bg_banner_top.jpg"
            alt="Banner Background"
            fill
            className="object-cover w-full h-full hidden lg:block"
            priority
            quality={100}
            sizes="100vw"
            style={{ zIndex: 0, objectPosition: 'center 30%' }}
          />

          {/* Background Image - Mobile */}
          <Image
            src="/images/bg_banner_top_mobile.jpg"
            alt="Banner Background Mobile"
            fill
            className="object-cover w-full h-full lg:hidden"
            priority
            quality={100}
            sizes="100vw"
            style={{ zIndex: 0, objectPosition: 'center top' }}
          />

          {/* Content */}
          <div className="relative z-10 flex items-center justify-center" style={{ minHeight: '600px' }}>
            <div className="text-center text-white px-4 max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {PRODUCTS_CONSTANTS.title}
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                {PRODUCTS_CONSTANTS.subtitle}
              </p>
            </div>
          </div>
        </section>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">

          {resultSummary}

          <div className="flex w-full gap-4 lg:gap-6">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white/90 backdrop-blur-md border border-white/30 rounded-3xl p-6 hidden lg:block flex-shrink-0 shadow-2xl">
              <div className="sticky top-8">
                {FilterContent}
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="group transition-transform duration-200"
                    >
                      <Skeleton className="w-full aspect-[4/3] mb-3 rounded-xl" />
                      <Skeleton className="h-5 w-3/4 mb-2 rounded" />
                      <Skeleton className="h-4 w-1/2 mb-2 rounded" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-1/2 rounded" />
                        <Skeleton className="h-8 w-1/2 rounded" />
                      </div>
                    </div>
                  ))
                ) : paginatedProducts.length === 0 ? (
                  <div className="col-span-full text-center py-16">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-xl max-w-md mx-auto">
                      <div className="text-gray-300 mb-6">
                        <Search className="w-20 h-20 mx-auto" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-700 mb-4">
                        {PRODUCTS_CONSTANTS.emptyState.title}
                      </h3>
                      <p className="text-gray-500 mb-6 leading-relaxed">
                        {PRODUCTS_CONSTANTS.emptyState.description}
                      </p>
                      <Button
                        onClick={handleResetFilters}
                        className="bg-[#a10000] hover:bg-red-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                      >
                        Xóa bộ lọc
                      </Button>
                    </div>
                  </div>
                ) : (
                  paginatedProducts.map((product, i) => (
                    <ProductCard key={i} product={product} />
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-16">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                    <Pagination>
                      <PaginationContent className="gap-2">
                        <PaginationItem>
                          <PaginationPrevious
                            aria-disabled={currentPage === 1}
                            tabIndex={currentPage === 1 ? -1 : 0}
                            onClick={currentPage === 1 ? undefined : handlePrev}
                            href="#"
                            className="text-[#a10000] hover:bg-[#a10000] hover:text-white rounded-xl transition-all duration-200"
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, idx) => (
                          <PaginationItem key={idx + 1}>
                            <PaginationLink
                              isActive={currentPage === idx + 1}
                              onClick={() => handlePageChange(idx + 1)}
                              href="#"
                              className={`rounded-xl transition-all duration-200 ${
                                currentPage === idx + 1
                                  ? 'bg-[#a10000] text-white shadow-lg scale-105'
                                  : 'text-[#a10000] hover:bg-[#a10000] hover:text-white hover:scale-105'
                              }`}
                            >
                              {idx + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            aria-disabled={currentPage === totalPages}
                            tabIndex={currentPage === totalPages ? -1 : 0}
                            onClick={
                              currentPage === totalPages ? undefined : handleNext
                            }
                            href="#"
                            className="text-[#a10000] hover:bg-[#a10000] hover:text-white rounded-xl transition-all duration-200"
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
