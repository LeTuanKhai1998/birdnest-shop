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
import { ViewMode } from '@/components/ui/ViewToggle';

type ProductCardProps = { 
  product: Product; 
  onClick?: () => void;
  viewMode?: ViewMode;
};

export const ProductCard = ({ product, viewMode = 'grid' }: ProductCardProps) => {
  const { data: session } = useSession();
  const wishlist = useWishlist();
  const { format } = useCurrencyFormat();
  const freeShippingThreshold = useFreeShippingThreshold();
  
  // Helper function to format weight consistently
  const formatWeight = (weight: any): string => {
    // Ensure weight is a valid number
    const numWeight = typeof weight === 'number' ? weight : 
                     typeof weight === 'string' ? parseInt(weight, 10) : 100;
    
    // Return formatted weight or default
    return isNaN(numWeight) || numWeight <= 0 ? '100g' : `${numWeight}g`;
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

  // Determine card layout based on view mode
  const getCardLayout = () => {
    switch (viewMode) {
      case 'list':
        return 'flex-row h-auto min-h-[200px]';
      default: // grid
        return 'flex-col h-full';
    }
  };

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
        <Card className={cn(
          "bg-white/90 backdrop-blur-sm border border-white/30 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 min-w-0 focus-within:ring-2 focus-within:ring-[#a10000]/20",
          getCardLayout()
        )}>
          <CardContent className="p-0 min-w-0 relative">
            {/* Product Image Section */}
            <div className={cn(
              "relative",
              viewMode === 'list' && "flex-shrink-0 w-48 sm:w-56 lg:w-64"
            )}>
              {/* Wishlist Icon - only show for authenticated users */}
              {session?.user && (
                <button
                  type="button"
                  aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={cn(
                    "absolute z-20 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-red-50 hover:scale-110 transition-all duration-200 border border-white/20",
                    viewMode === 'list' ? "top-2 right-2" : "top-4 right-4"
                  )}
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
              <div className={cn(
                "absolute z-20 bg-[#a10000]/90 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg border border-white/20",
                viewMode === 'list' ? "top-2 left-2" : "top-2 sm:top-4 left-2 sm:left-4"
              )}>
                <Package className="w-3 h-3 sm:w-4 sm:h-4 inline mr-0.5 sm:mr-1" />
                <span>{formatWeight(product.weight)}</span>
              </div>

              {/* Popular Badge */}
              {product.soldCount && product.soldCount > 1000 && (
                <div className={cn(
                  "absolute z-20 bg-orange-500/90 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg border border-white/20",
                  viewMode === 'list' ? "top-2 left-16" : "top-2 sm:top-4 left-16 sm:left-20"
                )}>
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 inline mr-0.5 sm:mr-1" />
                  <span>Hot</span>
                </div>
              )}

              {/* Free Shipping Badge */}
              {parseFloat(product.price) >= freeShippingThreshold && (
                <div className={cn(
                  "absolute z-20 bg-green-500/90 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg border border-white/20",
                  viewMode === 'list' ? "bottom-2 left-2" : "bottom-2 sm:bottom-4 left-2 sm:left-4"
                )}>
                  <Truck className="w-3 h-3 sm:w-4 sm:h-4 inline mr-0.5 sm:mr-1" />
                  <span>Miễn phí</span>
                </div>
              )}

              <Link
                href={`/products/${product.slug}`}
                prefetch={false}
                className="block min-w-0"
              >
                <div className={cn(
                  "relative w-full overflow-hidden",
                  viewMode === 'list' ? "h-48 sm:h-56 lg:h-64" : "aspect-square"
                )}>
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
            <div className={cn(
              "flex flex-col gap-2 sm:gap-2.5 lg:gap-3 flex-1 min-w-0",
              viewMode === 'list' ? "p-6 flex-1 justify-between" : "p-3 sm:p-4 lg:p-5"
            )}>
              {/* Product Header */}
              <div className="space-y-2">
                {/* Product Name */}
                <Link
                  href={`/products/${product.slug}`}
                  prefetch={false}
                  className={cn(
                    "font-bold text-gray-900 line-clamp-2 hover:text-[#a10000] transition-colors duration-200 leading-tight block",
                    viewMode === 'list' ? "text-lg sm:text-xl lg:text-2xl" : "text-sm sm:text-base lg:text-lg"
                  )}
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
                
                {/* Product Description for List View */}
                {viewMode === 'list' && product.description && (
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Product Meta */}
              <ProductMeta
                  rating={avgRating}
                  reviewCount={product.reviews?.length ?? 0}
                  soldCount={product.soldCount ?? 0}
                  className={cn(
                    "flex-wrap gap-x-1 sm:gap-x-2 gap-y-0.5 sm:gap-y-1 min-w-0",
                    viewMode === 'list' && "text-sm"
                  )}
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
                      <div className={cn(
                        "font-black text-[#a10000]",
                        viewMode === 'list' ? "text-base" : "text-lg sm:text-xl lg:text-2xl"
                      )}>
                        {formatPriceWithDiscount(product.price, product.discount).discounted}
                      </div>
                    </div>
                  </>
                ) : (
                  /* No Discount - Show Regular Price */
                  <div className={cn(
                    "font-black text-[#a10000]",
                    viewMode === 'list' ? "text-base" : "text-lg sm:text-xl lg:text-2xl"
                  )}>
                    {format(product.price)}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className={cn(
                  "flex flex-col gap-1 sm:gap-1.5 mt-auto",
                  viewMode === 'list' && "flex-row gap-3"
                )}>
                  {/* Desktop: Full buttons */}
                  <div className={cn(
                    "hidden md:flex gap-2",
                    viewMode === 'list' && "flex-1"
                  )}>
                    <AddToCartButton
                      product={product}
                      className={cn(
                        "bg-[#a10000] hover:bg-red-800 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg border-0 text-sm flex items-center justify-center",
                        viewMode === 'list' ? "h-12 flex-1" : "flex-1 h-10 lg:h-12"
                      )}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1.5" />
                      Thêm vào giỏ
                    </AddToCartButton>
                    <Link
                      href={`/products/${product.slug}`}
                      prefetch={false}
                      className={cn(
                        "border-2 border-[#a10000] text-[#a10000] font-semibold rounded-lg flex items-center justify-center text-center transition-all duration-200 hover:bg-[#a10000] hover:text-white hover:scale-105 shadow-lg text-sm",
                        viewMode === 'list' ? "h-12 flex-1" : "flex-1 h-10 lg:h-12"
                      )}
                      aria-label="View Details"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      Chi tiết
                    </Link>
                  </div>

                  {/* Mobile: Icon buttons */}
                  <div className={cn(
                    "flex gap-1.5 sm:gap-2 md:hidden",
                    viewMode === 'list' && "flex-1"
                  )}>
                    <AddToCartButton
                      product={product}
                      className={cn(
                        "bg-[#a10000] hover:bg-red-800 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg border-0 flex items-center justify-center",
                        viewMode === 'list' ? "h-10 flex-1" : "flex-1 h-8 sm:h-10"
                      )}
                    >
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    </AddToCartButton>
                    <Link
                      href={`/products/${product.slug}`}
                      prefetch={false}
                      className={cn(
                        "border-2 border-[#a10000] text-[#a10000] font-semibold rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-[#a10000] hover:text-white hover:scale-105 shadow-lg",
                        viewMode === 'list' ? "h-10 flex-1" : "flex-1 h-8 sm:h-10"
                      )}
                      aria-label="View Details"
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                  </div>
                </div>
              
              {/* Remove duplicate compact view buttons - they are redundant */}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
