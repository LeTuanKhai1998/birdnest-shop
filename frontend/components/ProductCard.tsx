import { Card, CardContent } from '@/components/ui/card';
import { AddToCartButton } from '@/components/AddToCartButton';
import { Eye, ShoppingCart, Heart, Package, TrendingUp, Truck } from 'lucide-react';
import { SmartImage } from '@/components/ui/SmartImage';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ProductMeta from '@/components/ProductMeta';
import { useWishlist } from '@/lib/wishlist-store';
import { useSession } from 'next-auth/react';
import { useCurrencyFormat, formatPriceWithDiscount } from '@/lib/currency-utils';
import { Product, Review } from '@/lib/types';
import { getFirstImageUrl, cn } from '@/lib/utils';
import { getCategoryTextColor, getCategoryBgColor } from '@/lib/category-colors';
import { useFreeShippingThreshold } from '@/lib/settings-context';

type ProductCardProps = { product: Product; onClick?: () => void };

export const ProductCard = ({ product }: ProductCardProps) => {
  const { data: session } = useSession();
  const wishlist = useWishlist();
  const { format } = useCurrencyFormat();
  const freeShippingThreshold = useFreeShippingThreshold();
  
  // Helper function to format weight consistently
  const formatWeight = (weight: any): string => {
    console.log('Raw weight value:', weight, 'Type:', typeof weight);
    if (typeof weight === 'number' && weight > 0) {
      const formatted = `${weight}g`;
      console.log('Formatted weight:', formatted);
      return formatted;
    }
    console.log('Using default weight: 100g');
    return '100g'; // Default fallback
  };
  
  // Don't show products that are out of stock
  if ((product.quantity || 0) <= 0) {
    return null;
  }
  
  // Only show wishlist functionality for authenticated users
  const isInWishlist = session?.user ? wishlist.isInWishlist(product.id) : false;
  
  const avgRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) /
        product.reviews.length
      : 0;

  return (
    <motion.div
      whileHover={{ 
        scale: 1.02, 
        y: -8,
        boxShadow: '0 20px 40px 0 rgba(0,0,0,0.12)' 
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        duration: 0.3,
      }}
    >
      <div className="group relative">
        <Card className="h-full flex flex-col bg-white/90 backdrop-blur-sm border border-white/30 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 min-w-0">
          <CardContent className="p-0 min-w-0 relative">
            {/* Product Image Section */}
            <div className="relative">
              {/* Wishlist Icon - only show for authenticated users */}
              {session?.user && (
                <button
                  type="button"
                  aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-red-50 hover:scale-110 transition-all duration-200 border border-white/20"
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
                  {isInWishlist ? (
                    <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                  ) : (
                    <Heart className="w-6 h-6 text-gray-500 hover:text-red-500 transition-colors" />
                  )}
                </button>
              )}

              {/* Weight Badge */}
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 bg-[#a10000]/90 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg border border-white/20">
                <Package className="w-3 h-3 sm:w-4 sm:h-4 inline mr-0.5 sm:mr-1" />
                {formatWeight(product.weight)}
              </div>

              {/* Popular Badge */}
              {product.soldCount && product.soldCount > 1000 && (
                <div className="absolute top-2 sm:top-4 left-16 sm:left-20 z-20 bg-orange-500/90 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg border border-white/20">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 inline mr-0.5 sm:mr-1" />
                  Hot
                </div>
              )}

              {/* Free Shipping Badge */}
              {parseFloat(product.price) >= freeShippingThreshold && (
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-20 bg-green-500/90 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg border border-white/20">
                  <Truck className="w-3 h-3 sm:w-4 sm:h-4 inline mr-0.5 sm:mr-1" />
                  Miễn phí vận chuyển
                </div>
              )}

              <Link
                href={`/products/${product.slug}`}
                prefetch={false}
                className="block min-w-0"
              >
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  <SmartImage
                    src={product.image || getFirstImageUrl(product.images) || '/images/placeholder-image.svg'}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </Link>
            </div>

                        {/* Product Info Section */}
            <div className="p-3 sm:p-4 lg:p-5 flex flex-col gap-2 sm:gap-2.5 lg:gap-3 flex-1 min-w-0">
              {/* Product Header */}
              <div className="space-y-2">
                {/* Product Name */}
                <Link
                  href={`/products/${product.slug}`}
                  prefetch={false}
                  className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 line-clamp-2 hover:text-[#a10000] transition-colors duration-200 leading-tight block"
                >
                  {product.name}
                </Link>
                
                {/* Product Category & Weight */}
                <div className="flex items-center gap-2 flex-wrap">
                  {product.category && (
                    <div className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full border",
                      getCategoryBgColor(product.category.name, product.category.colorScheme),
                      getCategoryTextColor(product.category.name, product.category.colorScheme)
                    )}>
                      {product.category.name}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                    {formatWeight(product.weight)}
                  </div>
                </div>
              </div>

              {/* Product Meta */}
              <ProductMeta
                rating={avgRating}
                reviewCount={product.reviews?.length ?? 0}
                soldCount={product.soldCount ?? 0}
                className="flex-wrap gap-x-1 sm:gap-x-2 gap-y-0.5 sm:gap-y-1 min-w-0"
              />

              {/* Price Section */}
              <div className="space-y-1">
                {product.discount && product.discount > 0 ? (
                  <>
                    {/* Discount Badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full font-semibold shadow-sm">
                        🔥 Giảm {product.discount}%
                      </span>
                      <span className="text-xs text-green-600 font-medium">
                        Tiết kiệm {formatPriceWithDiscount(product.price, product.discount).savings}
                      </span>
                    </div>
                    {/* Price Display */}
                    <div className="space-y-0.5">
                      <div className="text-sm text-gray-500 line-through">
                        {format(product.price)}
                      </div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-black text-[#a10000]">
                        {formatPriceWithDiscount(product.price, product.discount).discounted}
                      </div>
                    </div>
                  </>
                ) : (
                  /* No Discount - Show Regular Price */
                  <div className="text-lg sm:text-xl lg:text-2xl font-black text-[#a10000]">
                    {format(product.price)}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1 sm:gap-1.5 mt-auto">
                {/* Desktop: Full buttons */}
                <div className="hidden md:flex gap-2">
                  <AddToCartButton
                    product={product}
                    className="flex-1 h-10 lg:h-12 bg-[#a10000] hover:bg-red-800 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg border-0 text-sm flex items-center justify-center"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1.5" />
                    Thêm vào giỏ
                  </AddToCartButton>
                  <Link
                    href={`/products/${product.slug}`}
                    prefetch={false}
                    className="flex-1 h-10 lg:h-12 border-2 border-[#a10000] text-[#a10000] font-semibold rounded-lg flex items-center justify-center text-center transition-all duration-200 hover:bg-[#a10000] hover:text-white hover:scale-105 shadow-lg text-sm"
                    aria-label="View Details"
                  >
                    <Eye className="w-4 h-4 mr-1.5" />
                    Chi tiết
                  </Link>
                </div>

                {/* Mobile: Icon buttons */}
                <div className="flex gap-1.5 sm:gap-2 md:hidden">
                  <AddToCartButton
                    product={product}
                    className="flex-1 h-8 sm:h-10 bg-[#a10000] hover:bg-red-800 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg border-0 flex items-center justify-center"
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  </AddToCartButton>
                  <Link
                    href={`/products/${product.slug}`}
                    prefetch={false}
                    className="flex-1 h-8 sm:h-10 border-2 border-[#a10000] text-[#a10000] font-semibold rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-[#a10000] hover:text-white hover:scale-105 shadow-lg"
                    aria-label="View Details"
                  >
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
