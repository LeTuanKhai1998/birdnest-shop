'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
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
import { SortDropdown } from '@/components/ui/SortDropdown';
import { ViewToggle, ViewMode } from '@/components/ui/ViewToggle';

import { PRODUCTS_CONSTANTS } from '@/lib/constants';
import { Search, Filter, X, ChevronDown, Grid3X3, List, Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiService } from '@/lib/api';
import { getCategoryTextColor, getCategoryBgColor } from '@/lib/category-colors';
import { cn } from '@/lib/utils';
import { sortProducts, SortOption, getDefaultSortOption } from '@/lib/sorting-utils';
import Footer from '@/components/Footer';

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
  const [sortOption, setSortOption] = useState<SortOption>(getDefaultSortOption());
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [itemsPerPage, setItemsPerPage] = useState<number>(6); // Reduced to 6 to make pagination more likely and better for mobile

  const [expandedFilters, setExpandedFilters] = useState<string[]>(['type']);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories();
        setCategories(response);
      } catch (error) {
        // Set empty array on error to prevent undefined issues
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Filtering and sorting logic with useMemo for performance
  const filteredAndSortedProducts = useMemo(() => {
    // First filter the products
    const filtered = products.filter((product) => {
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

    // Then sort the filtered products
    return sortProducts(filtered, sortOption);
  }, [products, selectedCategories, selectedWeights, price, search, sortOption]);

  // Enhanced pagination logic
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Calculate page info
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length);
  const totalItems = filteredAndSortedProducts.length;

  // Generate smart page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = PRODUCTS_CONSTANTS.pagination.maxVisiblePages;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination with ellipsis
      if (currentPage <= 4) {
        // Near start: show first 5 pages + ellipsis + last page
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Near end: show first page + ellipsis + last 5 pages
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Middle: show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

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
    setExpandedFilters(['type']);
    setSortOption(getDefaultSortOption());
    setViewMode('grid');
    
    // If no products from backend, reload the page
    if (products.length === 0) {
      window.location.reload();
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
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
    <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg relative z-10">
      {/* Single Line Search and Controls */}
      <div className="flex flex-col lg:flex-row items-center gap-4">
        {/* Search Input - Takes up available space */}
        <div className="relative flex-1 min-w-0 max-w-[80%]">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Tìm kiếm sản phẩm yến sào..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-4 py-3 border-2 border-gray-200 focus:border-[#a10000] focus:ring-[#a10000] rounded-xl text-base shadow-sm transition-all duration-200 w-full"
          />
        </div>

        {/* Controls Group - Compact horizontal layout */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">Sắp xếp:</span>
            <SortDropdown
              value={sortOption}
              onValueChange={setSortOption}
              className="w-32 sm:w-36"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">Xem:</span>
            <ViewToggle
              value={viewMode}
              onValueChange={setViewMode}
            />
          </div>

          {/* Filter Button - Mobile/Tablet Only */}
          <div className="lg:hidden">
            <Drawer>
              <DrawerTrigger>
                <Button 
                  variant="outline"
                  className="border-[#a10000] text-[#a10000] hover:bg-[#a10000] hover:text-white transition-colors px-3 py-2"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Bộ lọc</span>
                </Button>
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

          {/* Product Count - Desktop Only */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-2 h-2 bg-[#a10000] rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              {filteredAndSortedProducts.length} sản phẩm
              {search && (
                <>
                  {' '}cho <span className="font-semibold text-gray-900 bg-yellow-100 px-2 py-1 rounded-full">&quot;{search}&quot;</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Product Count - Below the line */}
      <div className="lg:hidden mt-4 text-center">
        <div className="text-lg font-bold text-[#a10000] mb-1">
          {filteredAndSortedProducts.length}
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
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white">
      {/* Page Header - Full width like Home page */}
        <section
          className="relative w-full bg-[#a10000] overflow-hidden lg:bg-[#a10000] bg-gradient-to-b from-[#a10000] to-[#fbd8b0]"
          style={{ minHeight: '400px' }}
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
          <div className="relative z-10 flex items-center justify-center" style={{ minHeight: '400px' }}>
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
              <div className={cn(
                "bg-gray-50/30 rounded-3xl p-4 lg:p-6",
                viewMode === 'grid' && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6",
                viewMode === 'list' && "space-y-6"
              )} style={{ zIndex: 1 }}>
                {paginatedProducts.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl max-w-md mx-auto">
                      <div className="text-gray-300 mb-6">
                        <Search className="w-20 h-20 mx-auto" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-700 mb-4">
                        {products.length === 0 
                          ? 'Không có sản phẩm nào' 
                          : PRODUCTS_CONSTANTS.emptyState.title}
                      </h3>
                      <p className="text-gray-500 mb-6 leading-relaxed">
                        {products.length === 0 
                          ? 'Hiện tại không có sản phẩm nào trong hệ thống. Vui lòng thử lại sau hoặc liên hệ với chúng tôi nếu vấn đề vẫn tiếp tục.'
                          : PRODUCTS_CONSTANTS.emptyState.description}
                      </p>
                      {products.length === 0 && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            💡 <strong>Gợi ý:</strong> Kiểm tra xem backend API có đang chạy không tại{' '}
                            <code className="bg-yellow-100 px-2 py-1 rounded text-xs">
                              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}
                            </code>
                          </p>
                        </div>
                      )}
                      <Button
                        onClick={handleResetFilters}
                        className="bg-[#a10000] hover:bg-red-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                      >
                        {products.length === 0 ? 'Tải lại trang' : 'Xóa bộ lọc'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  paginatedProducts.map((product: Product, i: number) => (
                    <ProductCard 
                      key={product.id || i} 
                      product={product} 
                      viewMode={viewMode}
                    />
                  ))
                )}
              </div>

              {/* Enhanced Pagination */}
              {filteredAndSortedProducts.length > 0 && (
                <div className="mt-12">
                  {/* Single Line Pagination Layout */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-white to-gray-50/50 rounded-2xl border border-gray-100 shadow-sm">
                    {/* Left: Items per page selector */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">Hiển thị</span>
                      <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="w-20 h-9 bg-white border-gray-200 hover:border-gray-300 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCTS_CONSTANTS.pagination.options.map(option => (
                            <SelectItem key={option} value={option.toString()}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-gray-600">sản phẩm mỗi trang</span>
                    </div>

                    {/* Center: Page info */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#a10000] rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">
                        {totalItems > 0 
                          ? `Hiển thị ${startItem}-${endItem} trong ${totalItems} sản phẩm`
                          : 'Không có sản phẩm nào'
                        }
                      </span>
                    </div>

                    {/* Right: Pagination controls */}
                    {(totalPages > 1 || itemsPerPage < totalItems) && (
                      <div className="flex items-center gap-2">
                        <Pagination>
                          <PaginationContent className="gap-1">
                            {/* Previous Button */}
                            <PaginationItem>
                              <PaginationPrevious
                                aria-disabled={currentPage === 1}
                                tabIndex={currentPage === 1 ? -1 : 0}
                                onClick={currentPage === 1 ? undefined : handlePrev}
                                href="#"
                                className="text-[#a10000] hover:bg-[#a10000] hover:text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2"
                                aria-label="Trang trước"
                              >
                                Trước
                              </PaginationPrevious>
                            </PaginationItem>

                            {/* Page Numbers */}
                            {getPageNumbers().map((page, index) => (
                              <PaginationItem key={index}>
                                {page === '...' ? (
                                  <span className="px-3 py-2 text-gray-400 font-medium" aria-label="Các trang khác">•••</span>
                                ) : (
                                  <PaginationLink
                                    isActive={currentPage === page}
                                    onClick={() => handlePageChange(page as number)}
                                    href="#"
                                    className={`rounded-lg transition-all duration-200 px-3 py-2 min-w-[32px] text-center text-sm ${
                                      currentPage === page
                                        ? 'bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white shadow-lg scale-105 font-semibold'
                                        : 'text-[#a10000] hover:bg-[#a10000] hover:text-white hover:scale-105 border border-gray-200 hover:border-[#a10000]'
                                    }`}
                                    aria-label={`Trang ${page}`}
                                  >
                                    {page}
                                  </PaginationLink>
                                )}
                              </PaginationItem>
                            ))}

                            {/* Next Button */}
                            <PaginationItem>
                              <PaginationNext
                                aria-disabled={currentPage === totalPages}
                                tabIndex={currentPage === totalPages ? -1 : 0}
                                onClick={currentPage === totalPages ? undefined : handleNext}
                                href="#"
                                className="text-[#a10000] hover:bg-[#a10000] hover:text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2"
                                aria-label="Trang tiếp"
                              >
                                Tiếp
                              </PaginationNext>
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>

                  {/* Mobile Pagination - Keep separate for mobile */}
                  {(totalPages > 1 || itemsPerPage < totalItems) && (
                    <div className="flex justify-center sm:hidden mt-4">
                      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                        <div className="flex items-center justify-between gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="text-[#a10000] border-[#a10000] hover:bg-[#a10000] hover:text-white transition-all duration-200"
                            aria-label="Trang đầu"
                          >
                            Đầu
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePageChange(Math.max(1, currentPage - 5))}
                            disabled={currentPage <= 5}
                            className="text-[#a10000] border-[#a10000] hover:bg-[#a10000] hover:text-white transition-all duration-200"
                            aria-label="Lùi 5 trang"
                          >
                            -5
                          </Button>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white rounded-lg font-semibold text-sm" aria-label={`Trang hiện tại: ${currentPage}`}>
                              {currentPage}
                            </span>
                            <span className="text-sm text-gray-500">/ {totalPages}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 5))}
                            disabled={currentPage >= totalPages - 4}
                            className="text-[#a10000] border-[#a10000] hover:bg-[#a10000] hover:text-white transition-all duration-200"
                            aria-label="Tiến 5 trang"
                          >
                            +5
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="text-[#a10000] border-[#a10000] hover:bg-[#a10000] hover:text-white transition-all duration-200"
                            aria-label="Trang cuối"
                          >
                            Cuối
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
