'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Package, Star, ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { AddToCartButton } from '@/components/AddToCartButton';
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
          setRelatedProducts(combined);
        } else {
          setRelatedProducts(filtered.slice(0, maxProducts));
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
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg p-3 flex flex-col items-center animate-pulse">
              <div className="w-full h-36 bg-gray-200 rounded-lg mb-3"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-1/2 h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <Package className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-600 text-lg font-medium mb-2">Không có sản phẩm liên quan</p>
        <p className="text-gray-500 text-sm">Hãy khám phá các sản phẩm khác của chúng tôi</p>
        <Link href="/products">
          <Button className="mt-4 bg-[#a10000] hover:bg-[#8a0000] text-white">
            Xem tất cả sản phẩm
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Sản phẩm liên quan ({relatedProducts.length})
          </h3>
          <p className="text-sm text-gray-600">
            Khám phá thêm các sản phẩm tương tự
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="text-[#a10000] border-[#a10000] hover:bg-[#a10000] hover:text-white transition-all duration-200"
        >
          {showAll ? 'Thu gọn' : 'Xem thêm'}
        </Button>
      </div>

      {/* Products Grid */}
      <div className="relative">
        {/* Navigation arrows for pagination */}
        {totalPages > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={prevPage}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-lg hover:bg-white border border-gray-200 transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextPage}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-lg hover:bg-white border border-gray-200 transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentProducts.map((product, index) => {
            const isInWishlist = session?.user ? wishlist.isInWishlist(product.id) : false;
            const avgRating = product.reviews && product.reviews.length > 0
              ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
              : 0;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="relative">
                      {/* Wishlist Button */}
                      {session?.user && (
                        <button
                          type="button"
                          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                          className="absolute top-2 right-2 z-20 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-red-50 hover:scale-110 transition-all duration-200 border border-white/20"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isInWishlist) {
                              wishlist.remove(product.id, wishlist.mutate);
                            } else {
                              wishlist.add(product, wishlist.mutate);
                            }
                          }}
                        >
                          <svg
                            className={`w-4 h-4 ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-500 hover:text-red-500'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </button>
                      )}

                      {/* Weight Badge */}
                      <div className="absolute top-2 left-2 z-20 bg-[#a10000]/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg border border-white/20">
                        <Package className="w-3 h-3 inline mr-1" />
                        {product.weight}g
                      </div>

                      <Link href={`/products/${product.slug}`} className="block">
                        <div className="relative w-full" style={{ aspectRatio: '5/3' }}>
                          <Image
                            src={
                              product.images?.[0] ||
                              product.image ||
                              '/images/placeholder-image.svg'
                            }
                            alt={product.name}
                            fill
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                          />
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      </Link>
                    </div>

                    {/* Product Info */}
                    <div className="p-3 space-y-2">
                      {/* Product Name */}
                      <Link href={`/products/${product.slug}`}>
                        <h4 className="text-sm font-bold text-gray-900 hover:text-[#a10000] transition-colors line-clamp-2 leading-tight">
                          {product.name}
                        </h4>
                      </Link>

                      {/* Product Category */}
                      {product.category && (
                        <div className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full inline-block",
                          getCategoryBgColor(product.category.name, product.category.colorScheme),
                          getCategoryTextColor(product.category.name, product.category.colorScheme)
                        )}>
                          {product.category.name}
                        </div>
                      )}

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= avgRating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({product.reviews?.length || 0})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="text-[#a10000] font-black text-lg">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                          maximumFractionDigits: 0,
                        }).format(parseFloat(product.price))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <AddToCartButton
                          product={product}
                          className="flex-1 h-8 bg-[#a10000] hover:bg-red-800 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg border-0 text-xs flex items-center justify-center"
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Thêm vào giỏ
                        </AddToCartButton>
                        <Link
                          href={`/products/${product.slug}`}
                          className="flex-1 h-8 border-2 border-[#a10000] text-[#a10000] font-semibold rounded-lg flex items-center justify-center text-center transition-all duration-200 hover:bg-[#a10000] hover:text-white hover:scale-105 shadow-lg text-xs"
                        >
                          <Eye className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentPage ? 'bg-[#a10000]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* View All Products Link */}
      <div className="text-center pt-4 border-t border-gray-200">
        <Link href="/products">
          <Button variant="outline" className="text-[#a10000] border-[#a10000] hover:bg-[#a10000] hover:text-white transition-all duration-200">
            Xem tất cả sản phẩm
          </Button>
        </Link>
      </div>
    </div>
  );
}
