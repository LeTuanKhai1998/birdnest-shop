'use client';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/ProductCard';
import { useWishlist } from '@/lib/wishlist-store';
import { useSession } from 'next-auth/react';
import { getCategoryTextColor, getCategoryBgColor } from '@/lib/category-colors';
import { cn } from '@/lib/utils';

export default function RelatedProducts({
  currentProductId,
  categoryId,
}: {
  currentProductId: string;
  categoryId: string;
}) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  
  const { data: session } = useSession();
  const wishlist = useWishlist();
  
  const productsPerPage = 4;
  const maxProducts = showAll ? 12 : 8;

  // Function to fetch reviews for a product
  const fetchProductReviews = async (productId: string) => {
    try {
      const reviews = await apiService.getProductReviews(productId);
      return reviews;
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      return [];
    }
  };

  // Function to enhance product with real review data
  const enhanceProductWithReviews = async (product: Product): Promise<Product> => {
    try {
      const reviews = await fetchProductReviews(product.id);
      return {
        ...product,
        reviews: reviews,
      };
    } catch (error) {
      console.error(`Error enhancing product ${product.id}:`, error);
      return product;
    }
  };

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch products from the same category, excluding the current product
        const products = await apiService.getProducts({ categoryId });
        const filtered = products.filter((p: Product) => p.id !== currentProductId);
        
        // If we don't have enough products from the same category, fetch more products
        if (filtered.length < maxProducts) {
          const allProducts = await apiService.getProducts();
          const otherProducts = allProducts.filter((p: Product) => 
            p.id !== currentProductId && !filtered.some((fp: Product) => fp.id === p.id)
          );
          
          // Combine category products with other products, prioritizing category products
          const combined = [...filtered, ...otherProducts].slice(0, maxProducts);
          
          // Enhance products with real review data
          const enhancedProducts = await Promise.all(
            combined.map((product: Product) => enhanceProductWithReviews(product))
          );
          
          setRelatedProducts(enhancedProducts);
        } else {
          // Enhance products with real review data
          const enhancedProducts = await Promise.all(
            filtered.slice(0, maxProducts).map((product: Product) => enhanceProductWithReviews(product))
          );
          
          setRelatedProducts(enhancedProducts);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, categoryId, maxProducts]);

  const totalPages = Math.ceil(relatedProducts.length / productsPerPage);
  const startIndex = currentPage * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = relatedProducts.slice(startIndex, endIndex);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#a10000] to-[#c41e3a] rounded-lg animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Loading Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="group">
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-white to-gray-50/50 rounded-3xl" />
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-[#a10000]/5 to-[#c41e3a]/5 rounded-full blur-3xl" />
          
          <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-12">
            <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Không có sản phẩm liên quan</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Hãy khám phá các sản phẩm khác từ bộ sưu tập đa dạng của chúng tôi
            </p>
            <Link href="/products">
              <Button className="bg-[#a10000] hover:bg-[#8a0000] text-white font-medium px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-lg">
                Xem tất cả sản phẩm
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#a10000] to-[#c41e3a] rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Sản phẩm liên quan
            </h3>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
              {relatedProducts.length}
            </span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Khám phá thêm các sản phẩm tương tự từ cùng danh mục
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="group relative overflow-hidden bg-white border-gray-200 hover:border-[#a10000] hover:bg-[#a10000] hover:text-white transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-2">
              {showAll ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  Thu gọn
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Xem thêm
                </>
              )}
            </span>
          </Button>
        </div>
      </div>

      {/* Enhanced Products Section */}
      <div className="relative">
        {/* Modern Navigation Arrows */}
        {totalPages > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={prevPage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/95 backdrop-blur-sm shadow-lg hover:bg-white border border-gray-200/50 hover:border-gray-300 transition-all duration-300 rounded-full group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextPage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/95 backdrop-blur-sm shadow-lg hover:bg-white border border-gray-200/50 hover:border-gray-300 transition-all duration-300 rounded-full group"
            >
              <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </Button>
          </>
        )}

        {/* Enhanced Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.2 }
              }}
            >
              <div className="group">
                              <div className="relative">
                  <ProductCard product={product} />
                  {/* Subtle hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modern Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`relative w-3 h-3 rounded-full transition-all duration-300 ${
                  i === currentPage 
                    ? 'bg-[#a10000] scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                {i === currentPage && (
                  <motion.div
                    layoutId="activeDot"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: '#a10000',
                      borderRadius: '50%'
                    }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced CTA Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent" />
        <div className="relative text-center py-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-full shadow-sm">
            <Package className="w-5 h-5 text-[#a10000]" />
            <span className="text-gray-700 font-medium">Khám phá toàn bộ bộ sưu tập</span>
            <Link href="/products">
              <Button 
                size="sm"
                className="bg-[#a10000] hover:bg-[#8a0000] text-white font-medium transition-all duration-300 hover:scale-105"
              >
                Xem tất cả
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
