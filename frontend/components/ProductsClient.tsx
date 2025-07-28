"use client";
import React, { useState, useEffect } from "react";
import { ProductCard, type Product } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { productsApi } from "@/lib/api-service";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const nestTypes = ["Refined Nest", "Raw Nest", "Feather-removed Nest"];
const weights = [50, 100, 200];
const minPrice = 0;
const maxPrice = 10000000;
const PRODUCTS_PER_PAGE = 8;

interface PaginationData {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // State for pagination and filters
  const [paginationData, setPaginationData] = useState<PaginationData>({
    products: initialProducts,
    total: 0,
    page: parseInt(searchParams.get('page') || '1'),
    limit: PRODUCTS_PER_PAGE,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedWeights, setSelectedWeights] = useState<number[]>([]);
  const [price, setPrice] = useState<number>(maxPrice);
  const [search, setSearch] = useState(searchParams.get('search') || "");

  // Fetch products with filters and pagination
  const fetchProducts = async (page: number = 1, filters?: any) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: PRODUCTS_PER_PAGE,
      };

      // Add search parameter
      if (search.trim()) {
        params.search = search.trim();
      }

      // Add price filter
      if (price < maxPrice) {
        params.maxPrice = price;
      }

      // Add type filters (map to category names)
      if (selectedTypes.length > 0) {
        // Map Vietnamese types to category names
        const typeMapping: { [key: string]: string } = {
          "Refined Nest": "Yến tinh chế",
          "Raw Nest": "Tổ yến thô", 
          "Feather-removed Nest": "Yến rút lông"
        };
        // For now, we'll use search parameter for type filtering
        // In a real implementation, you'd want category-based filtering
      }

      // Add weight filters
      if (selectedWeights.length > 0) {
        // Weight filtering would need to be implemented on the backend
        // For now, we'll use search parameter
      }

      const response = await productsApi.getProducts(params);
      
      if (response.data) {
        const products = response.data.products || response.data.data || [];
        const total = response.data.total || products.length;
        const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
        
        // Map API products to UI format
        const uiProducts = products.map((product: any) => ({
          id: product.id,
          slug: product.slug,
          name: product.name,
          images: product.images?.map((img: { url: string }) => img.url) || ["/images/placeholder.png"],
          price: product.price,
          description: product.description,
          weight: (() => {
            if (product.name.includes("50g")) return 50;
            if (product.name.includes("100g")) return 100;
            if (product.name.includes("200g")) return 200;
            return 50;
          })(),
          type: (() => {
            if (product.name.includes("tinh chế")) return "Yến tinh chế";
            if (product.name.includes("rút lông")) return "Yến rút lông";
            if (product.name.includes("thô")) return "Tổ yến thô";
            return "Khác";
          })(),
          quantity: product.quantity || 0,
          reviews: product.reviews || [],
          sold: 0,
        }));

        setPaginationData({
          products: uiProducts,
          total,
          page,
          limit: PRODUCTS_PER_PAGE,
          totalPages
        });
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setPaginationData(prev => ({
        ...prev,
        products: [],
        total: 0,
        totalPages: 0
      }));
    } finally {
      setLoading(false);
    }
  };

  // Update URL with current filters and pagination
  const updateURL = (page: number, filters?: any) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (search.trim()) params.set('search', search.trim());
    
    const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newURL, { scroll: false });
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchProducts(1);
  }, []);

  // Handle filter changes
  useEffect(() => {
    if (paginationData.page > 1) {
      fetchProducts(1);
      updateURL(1);
    }
  }, [selectedTypes, selectedWeights, price]);

  // Handlers
  const handleTypeChange = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleWeightChange = (weight: number) => {
    setSelectedWeights((prev) =>
      prev.includes(weight) ? prev.filter((w) => w !== weight) : [...prev, weight]
    );
  };

  const handlePriceChange = (value: number[]) => {
    setPrice(value[0]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1);
    updateURL(1);
  };

  const handlePageChange = (page: number) => {
    fetchProducts(page);
    updateURL(page);
  };

  const handlePrev = () => {
    const newPage = Math.max(1, paginationData.page - 1);
    handlePageChange(newPage);
  };

  const handleNext = () => {
    const newPage = Math.min(paginationData.totalPages, paginationData.page + 1);
    handlePageChange(newPage);
  };

  const handleResetFilters = () => {
    setSelectedTypes([]);
    setSelectedWeights([]);
    setPrice(maxPrice);
    setSearch("");
    fetchProducts(1);
    updateURL(1);
  };

  // Apply client-side filtering for type and weight (since backend doesn't support these yet)
  const filteredProducts = paginationData.products.filter((product) => {
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(product.type ?? "");
    const weightMatch = selectedWeights.length === 0 || selectedWeights.includes(product.weight);
    return typeMatch && weightMatch;
  });

  const FilterContent = (
    <>
      <h2 className="text-lg font-semibold md:hidden mb-2">Bộ lọc</h2>
      <Accordion type="multiple" className="space-y-2">
        <AccordionItem value="type">
          <AccordionTrigger>Loại</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              {nestTypes.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => handleTypeChange(type)}
                    id={`type-${type}`}
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="weight">
          <AccordionTrigger>Trọng lượng</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              {weights.map((weight) => (
                <label key={weight} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedWeights.includes(weight)}
                    onCheckedChange={() => handleWeightChange(weight)}
                    id={`weight-${weight}`}
                  />
                  <span className="text-sm">{weight}g</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger>Giá</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              <Slider
                min={minPrice}
                max={maxPrice}
                value={[price]}
                onValueChange={handlePriceChange}
                step={100000}
              />
              <div className="flex justify-between text-xs mt-1">
                <span>0₫</span>
                <span>{currencyFormatter.format(price)}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Button variant="ghost" size="sm" className="px-2 py-1 mt-4 w-full" onClick={handleResetFilters}>Đặt lại</Button>
    </>
  );

  const resultSummary = (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="text-sm text-muted-foreground">
        {paginationData.total} kết quả
        {search && (
          <>
            {" "}cho <span className="font-semibold text-gray-900">'{search}'</span>
          </>
        )}
      </div>
      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          className="px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
        />
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Đang tìm..." : "Tìm"}
        </Button>
      </form>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="w-full flex justify-end px-2 pt-2 pb-1 sticky top-[56px] z-20 bg-white border-b md:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" className="py-2 px-4 text-base">Bộ lọc</Button>
          </DrawerTrigger>
          <DrawerContent className="max-w-sm mx-auto rounded-t-lg">
            <DrawerHeader>
              <DrawerTitle>Bộ lọc</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 pb-8">{FilterContent}</div>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full mb-4 py-3 text-base">Đóng</Button>
            </DrawerClose>
          </DrawerContent>
        </Drawer>
      </div>
      <main className="flex-1 p-2 sm:p-4 md:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Danh mục sản phẩm</h1>
        {resultSummary}
        <div className="flex w-full gap-6">
          <aside className="w-72 bg-gray-50 border-r p-6 hidden md:block flex-shrink-0">
            {FilterContent}
          </aside>
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 lg:gap-6">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="group transition-transform duration-200">
                    <Skeleton className="w-full aspect-[4/3] mb-2 sm:mb-3 rounded-xl" />
                    <Skeleton className="h-5 w-3/4 mb-1 sm:mb-2 rounded" />
                    <Skeleton className="h-4 w-1/2 mb-1 sm:mb-2 rounded" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-1/2 rounded" />
                      <Skeleton className="h-8 w-1/2 rounded" />
                    </div>
                  </div>
                ))
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">Không tìm thấy sản phẩm nào.</div>
              ) : (
                filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>
            {paginationData.totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-1">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        aria-disabled={paginationData.page === 1}
                        tabIndex={paginationData.page === 1 ? -1 : 0}
                        onClick={paginationData.page === 1 ? undefined : handlePrev}
                        href="#"
                      />
                    </PaginationItem>
                    {Array.from({ length: paginationData.totalPages }, (_, idx) => (
                      <PaginationItem key={idx + 1}>
                        <PaginationLink
                          isActive={paginationData.page === idx + 1}
                          onClick={() => handlePageChange(idx + 1)}
                          href="#"
                        >
                          {idx + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        aria-disabled={paginationData.page === paginationData.totalPages}
                        tabIndex={paginationData.page === paginationData.totalPages ? -1 : 0}
                        onClick={paginationData.page === paginationData.totalPages ? undefined : handleNext}
                        href="#"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 