import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { AddToCartButton } from '@/components/AddToCartButton';
import { Eye, ShoppingCart, Heart, HeartOff, Star, Package, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ProductMeta from '@/components/ProductMeta';
import { useWishlist } from '@/lib/wishlist-store';
import { useSession } from 'next-auth/react';

export interface Product {
  id: string;
  slug: string;
  name: string;
  image?: string;
  images?: string[];
  price: number;
  weight: number;
  description: string;
  type?: string;
  quantity?: number;
  reviews?: Review[];
  sold?: number;
  categoryId?: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

type ProductCardProps = { product: Product; onClick?: () => void };

export const ProductCard = ({ product }: ProductCardProps) => {
  const { data: session } = useSession();
  const wishlist = useWishlist();
  
  // Only show wishlist functionality for authenticated users
  const isInWishlist = session?.user ? wishlist.isInWishlist(product.id) : false;
  
  const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });
  
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
      <div className="group">
      <div className="relative">
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
                {product.weight}g
              </div>

              {/* Popular Badge */}
              {product.sold && product.sold > 1000 && (
                <div className="absolute top-2 sm:top-4 left-16 sm:left-20 z-20 bg-orange-500/90 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg border border-white/20">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 inline mr-0.5 sm:mr-1" />
                  Hot
                </div>
              )}

              <Link
                href={`/products/${product.slug}`}
                prefetch={false}
                className="block min-w-0"
              >
                <div className="relative w-full" style={{ aspectRatio: '5/3' }}>
                  <Image
                    src={
                      product.image || (product.images && product.images[0]) || ''
                    }
                    alt={product.name}
                    fill
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </Link>
            </div>

            {/* Product Info Section */}
            <div className="p-2 sm:p-3 lg:p-4 flex flex-col gap-1.5 sm:gap-2 lg:gap-3 flex-1 min-w-0">
              {/* Product Name */}
              <div className="min-w-0">
                <Link
                  href={`/products/${product.slug}`}
                  prefetch={false}
                  className="text-xs sm:text-sm lg:text-base font-bold text-gray-900 line-clamp-2 mb-0.5 sm:mb-1 hover:text-[#a10000] transition-colors duration-200 leading-tight"
                >
                  {product.name}
                </Link>
                
                {/* Product Type */}
                {product.type && (
                  <div className="text-xs text-gray-500 font-medium mb-0.5 sm:mb-1 lg:mb-2">
                    {product.type}
                  </div>
                )}
              </div>

              {/* Product Meta */}
              <ProductMeta
                rating={avgRating}
                reviewCount={product.reviews?.length ?? 120}
                soldCount={product.sold ?? 1500}
                className="flex-wrap gap-x-1 sm:gap-x-2 gap-y-0.5 sm:gap-y-1 min-w-0 mb-0.5 sm:mb-1 lg:mb-1.5"
              />

              {/* Price */}
              <div className="mb-2 sm:mb-3 lg:mb-4">
                <div className="text-base sm:text-lg lg:text-xl font-black text-[#a10000] mb-0.5 sm:mb-1">
                  {currencyFormatter.format(product.price)}
                </div>
                <div className="text-xs text-gray-500">
                  Giá đã bao gồm VAT
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1.5 sm:gap-2 mt-auto">
                {/* Desktop: Full buttons */}
                <div className="hidden md:flex gap-2">
                  <AddToCartButton
                    product={product}
                    className="flex-1 h-8 lg:h-10 bg-[#a10000] hover:bg-red-800 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg border-0 text-xs flex items-center justify-center"
                  >
                    <ShoppingCart className="w-3 h-3 mr-1.5" />
                    Thêm vào giỏ
                  </AddToCartButton>
                  <Link
                    href={`/products/${product.slug}`}
                    prefetch={false}
                    className="flex-1 h-8 lg:h-10 border-2 border-[#a10000] text-[#a10000] font-semibold rounded-lg flex items-center justify-center text-center transition-all duration-200 hover:bg-[#a10000] hover:text-white hover:scale-105 shadow-lg text-xs"
                    aria-label="View Details"
                  >
                    <Eye className="w-3 h-3 mr-1.5" />
                    Chi tiết
                  </Link>
                </div>

                {/* Mobile: Icon buttons */}
                <div className="flex gap-1.5 sm:gap-2 md:hidden">
                  <AddToCartButton
                    product={product}
                    className="flex-1 h-6 sm:h-8 bg-[#a10000] hover:bg-red-800 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg border-0 flex items-center justify-center"
                  >
                    <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                  </AddToCartButton>
                  <Link
                    href={`/products/${product.slug}`}
                    prefetch={false}
                    className="flex-1 h-6 sm:h-8 border-2 border-[#a10000] text-[#a10000] font-semibold rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-[#a10000] hover:text-white hover:scale-105 shadow-lg"
                    aria-label="View Details"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </motion.div>
  );
};
