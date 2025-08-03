'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddToCartButton } from '@/components/AddToCartButton';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Home, ChevronRight, Truck, Shield, Clock, Heart, ShoppingCart, CheckCircle, Package, Award, Users, TrendingUp, Facebook, Instagram, ShoppingBag, Music, MapPin, Phone, Mail, Globe } from 'lucide-react';
import ProductImageGallery from '@/components/ProductImageGallery';
import RelatedProducts from '@/components/RelatedProducts';
import { useWishlist } from '@/lib/wishlist-store';
import { useSession } from 'next-auth/react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { useReducedMotion } from 'framer-motion';
import { Product, Review } from '@/lib/types';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategoryTextColor, getCategoryBgColor } from '@/lib/category-colors';
import { cn } from '@/lib/utils';
import { useSetting } from '@/lib/settings-context';
import Footer from '@/components/Footer';
import { formatReadableId, getEntityTypeColor, getEntityTypeLabel } from '@/lib/id-utils';

// Format sold count for display
function formatSoldCount(count: number): string {
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return count.toString();
}

// Adapter function to convert API product to component product
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptProduct(apiProduct: any): Product {
  return {
    id: apiProduct.id,
    readableId: apiProduct.readableId,
    slug: apiProduct.slug,
    name: apiProduct.name,
    image: apiProduct.image,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    images: apiProduct.images?.map((img: any) => typeof img === 'string' ? img : img.url) || [],
    price: apiProduct.price,
    weight: apiProduct.weight,
    description: apiProduct.description,
    quantity: apiProduct.quantity,
    soldCount: apiProduct.soldCount || 0,
    reviews: apiProduct.reviews || [],
    categoryId: apiProduct.categoryId,
    category: apiProduct.category,
    discount: apiProduct.discount || 0,
    createdAt: apiProduct.createdAt,
    updatedAt: apiProduct.updatedAt,
    _count: apiProduct._count || { reviews: 0 },
  } as Product;
}

// SEO Metadata component
function ProductSEO({ product }: { product: Product }) {
  return (
    <>
      <title>{product.name} – Birdnest Shop</title>
      <meta name="description" content={product.description.substring(0, 160)} />
      <meta property="og:title" content={product.name} />
      <meta property="og:description" content={product.description.substring(0, 160)} />
      <meta property="og:type" content="product" />
      <meta property="og:url" content={`https://birdnest.shop/products/${product.slug}`} />
      {product.images && product.images[0] && (
        <meta property="og:image" content={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url} />
      )}
      <meta property="product:price:amount" content={product.price.toString()} />
      <meta property="product:price:currency" content="VND" />
    </>
  );
}

// Breadcrumbs component
function Breadcrumbs({ product }: { product: Product }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-1 text-sm">
        <li className="flex items-center">
          <Link 
            href="/" 
            className="flex items-center gap-1.5 px-2 py-1.5 text-gray-600 hover:text-[#a10000] transition-colors duration-200 rounded-md hover:bg-gray-100 group"
            aria-label="Go to homepage"
          >
            <Home className="w-3 h-3 md:w-4 md:h-4 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-medium hidden sm:inline text-xs md:text-sm">Trang chủ</span>
          </Link>
        </li>
        
        <li className="flex items-center">
          <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
          <Link 
            href="/products" 
            className="px-2 py-1.5 text-gray-600 hover:text-[#a10000] transition-colors duration-200 rounded-md hover:bg-gray-100 font-medium text-xs md:text-sm"
          >
            Sản phẩm
          </Link>
        </li>
        
        {product.category && (
          <li className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
            <Link 
              href={`/products?categoryId=${product.category.id}`} 
              className={cn(
                "px-2 py-1.5 rounded-md transition-all duration-200 font-medium hover:scale-105 text-xs md:text-sm",
                getCategoryBgColor(product.category.name, product.category.colorScheme),
                getCategoryTextColor(product.category.name, product.category.colorScheme),
                "hover:shadow-sm"
              )}
            >
              {product.category.name}
            </Link>
          </li>
        )}
        
        <li className="flex items-center">
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400 mx-1" />
          <span 
            className="px-2 py-1.5 text-gray-900 font-semibold bg-gray-100 rounded-md max-w-[150px] sm:max-w-[200px] md:max-w-[300px] truncate text-xs md:text-sm"
            aria-current="page"
          >
            {product.name}
          </span>
        </li>
      </ol>
    </nav>
  );
}

// Product benefits section
function ProductBenefits() {
  const benefits = [
    {
      icon: Truck,
      text: 'Miễn phí vận chuyển',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Cho đơn hàng từ 1.000.000đ',
      gradient: 'from-green-50 to-emerald-50'
    },
    {
      icon: Shield,
      text: 'Đảm bảo chất lượng',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: '100% chính hãng',
      gradient: 'from-blue-50 to-cyan-50'
    },
    {
      icon: Clock,
      text: 'Giao hàng nhanh',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: '2-4 ngày làm việc',
      gradient: 'from-orange-50 to-amber-50'
    },
    {
      icon: Award,
      text: 'Thanh toán an toàn',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Bảo mật thông tin',
      gradient: 'from-purple-50 to-violet-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
      {benefits.map((benefit, index) => (
        <div
          key={benefit.text}
          className={`bg-gradient-to-br ${benefit.gradient} rounded-lg md:rounded-xl p-3 md:p-4 border ${benefit.borderColor} hover:shadow-lg transition-all duration-300 group hover:scale-105`}
        >
          <div className="flex items-start gap-2 md:gap-3">
            <div className={`p-1.5 md:p-2 rounded-full ${benefit.bgColor} group-hover:scale-110 transition-transform shadow-sm flex-shrink-0`}>
              <benefit.icon className={`w-4 h-4 md:w-5 md:h-5 ${benefit.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-semibold text-gray-900 mb-0.5 md:mb-1">{benefit.text}</p>
              <p className="text-xs text-gray-600">{benefit.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  const decodedSlug = decodeURIComponent(slug);
  const router = useRouter();
  
  // Get settings
  const storeName = useSetting('storeName') || 'Birdnest Shop';
  const storeEmail = useSetting('storeEmail') || 'admin@birdnest.com';
  const storePhone = useSetting('storePhone') || '0919.844.822';
  const address = useSetting('address') || '45 Trần Hưng Đạo, Đảo, Rạch Giá, Kiên Giang';
  const logoUrl = useSetting('logoUrl') || '/images/logo.png';
  
  // State for product data
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Review form state
  const [reviewRating, setReviewRating] = React.useState(0);
  const [reviewComment, setReviewComment] = React.useState('');
  const [localReviews, setLocalReviews] = React.useState<Review[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitMsg, setSubmitMsg] = React.useState('');
  const [userHasReviewed, setUserHasReviewed] = React.useState(false);
  const [userReview, setUserReview] = React.useState<Review | null>(null);
  
  // Hooks that need to be called unconditionally
  const { data: session } = useSession();
  const { isInWishlist, add, remove, loading: wishlistLoading, mutate } = useWishlist();
  const shouldReduceMotion = useReducedMotion();

  // Fetch product data and reviews
  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await apiService.getProductBySlug(decodedSlug);
        const adaptedProduct = adaptProduct(productData);
        setProduct(adaptedProduct);
        
        // Set initial reviews from product data
        setLocalReviews(productData?.reviews || []);
        
        // Optionally fetch additional reviews if needed
        if (adaptedProduct && (!productData?.reviews || productData.reviews.length === 0)) {
          try {
            const reviews = await apiService.getProductReviews(adaptedProduct.id);
            setLocalReviews(reviews);
          } catch (reviewError) {
            console.error('Error fetching reviews:', reviewError);
            // Don't fail the whole page if reviews fail to load
          }
        }
        
        // Check if user has already reviewed this product
        if (session?.user?.id && adaptedProduct) {
          try {
            const userReviews = await apiService.getUserReviews(session.user.id);
            const existingReview = userReviews.find((review: any) => review.productId === adaptedProduct.id);
            if (existingReview) {
              setUserHasReviewed(true);
              setUserReview(existingReview);
            }
          } catch (error) {
            console.error('Error checking user review:', error);
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [decodedSlug]);

  // Handle Buy Now
  const handleBuyNow = () => {
    if (product) {
      // Add to cart and redirect to checkout
      // This would typically add to cart first, then redirect
      router.push('/checkout');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white">
        <main className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
          {/* Breadcrumbs skeleton */}
          <div className="flex items-center space-x-2 mb-8">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          
          {/* Main content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image gallery skeleton */}
            <div className="space-y-4">
              <Skeleton className="w-full aspect-square rounded-xl" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="w-16 h-16 rounded-lg" />
                ))}
              </div>
            </div>
            
            {/* Product info skeleton */}
            <div className="space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-8 w-3/4" />
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="w-4 h-4 rounded" />
                  ))}
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <div className="flex gap-2">
                  <Skeleton className="w-8 h-8 rounded" />
                  <Skeleton className="w-12 h-8 rounded" />
                  <Skeleton className="w-8 h-8 rounded" />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Skeleton className="h-12 flex-1 rounded-lg" />
                <Skeleton className="h-12 flex-1 rounded-lg" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error || !product) {
    return notFound();
  }

  // Derived state (not hooks)
  const images = product?.images || (product?.image ? [product.image] : []);
  const favorited = product ? isInWishlist(product.id) : false;
  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc: number, review: Review) => acc + review.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white">
      {/* SEO Metadata */}
      <ProductSEO product={product} />
      
      <main className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
        {/* Breadcrumbs */}
        <Breadcrumbs product={product} />

        {/* Main Product Section */}
        <Card className="mb-8 shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Image Gallery */}
              <div className="relative bg-gradient-to-br from-gray-50 to-white">
                <div className="p-4 md:p-6 lg:p-8">
                  <ProductImageGallery 
                    images={product.images.map(img => typeof img === 'string' ? img : img.url)} 
                    productName={product.name} 
                  />
                </div>
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/10 pointer-events-none" />
                

              </div>

              {/* Product Info */}
              <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 bg-gradient-to-br from-gray-50/50 to-white">
                {/* Product Header */}
                <div className="space-y-2 md:space-y-3">
                  {/* Product Title and Wishlist */}
                  <div className="flex items-start justify-between gap-3 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight mb-1">
                        {product.name}
                      </h1>
                      {/* SKU/Product Code */}
                      <p className="text-xs md:text-sm text-gray-500 font-mono">
                        Mã SP: {formatReadableId(product.readableId, product.id)}
                      </p>
                    </div>
                    {/* Wishlist Heart Button */}
                    {session?.user && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <button
                              type="button"
                              aria-label={
                                favorited ? 'Remove from Wishlist' : 'Add to Wishlist'
                              }
                              className={`rounded-full bg-white/90 shadow-lg p-2 md:p-3 hover:bg-red-50 transition-all duration-200 border border-gray-200 hover:scale-105 ${favorited ? 'text-red-600 shadow-red-100' : 'text-gray-400 hover:text-red-500'}`}
                              onClick={() => {
                                if (favorited) {
                                  remove(product.id, mutate);
                                  toast.success('Đã xóa khỏi danh sách yêu thích');
                                } else {
                                  add(product, mutate);
                                  toast.success('Đã thêm vào danh sách yêu thích');
                                }
                              }}
                              disabled={wishlistLoading}
                            >
                              <motion.span
                                initial={false}
                                animate={
                                  favorited
                                    ? {
                                        scale: [1, 1.3, 0.95, 1.1, 1],
                                        opacity: [1, 1, 1, 1, 1],
                                        rotate: [0, 10, -10, 0, 0],
                                        color: '#dc2626',
                                      }
                                    : { scale: 1, color: '#9ca3af' }
                                }
                                transition={{
                                  duration: shouldReduceMotion ? 0 : 0.6,
                                  ease: 'easeOut',
                                }}
                              >
                                <Heart
                                  className={`w-5 h-5 md:w-6 md:h-6 ${favorited ? 'fill-current' : ''}`}
                                />
                              </motion.span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {favorited ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  {/* Rating and Reviews */}
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 md:w-4 md:h-4 ${
                            star <= averageRating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm md:text-base font-bold text-gray-900">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs md:text-sm text-gray-600">•</span>
                    <span className="text-xs md:text-sm text-gray-600">{product.reviews?.length || 0} đánh giá</span>
                    <span className="text-xs md:text-sm text-gray-600">•</span>
                    <span className="text-xs md:text-sm text-gray-600">{formatSoldCount(product.soldCount || 0)} Đã bán</span>
                  </div>
                </div>

                                {/* Price Section */}
                <div className="space-y-3 md:space-y-4 p-4 md:p-5 lg:p-6 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-xl md:rounded-2xl border border-red-200 shadow-sm">
                  {/* Main Price Display */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex flex-col flex-1">
                      {product.discount && product.discount > 0 ? (
                        <>
                          {/* Original Price */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <span className="text-xl sm:text-2xl md:text-3xl text-gray-500 line-through">
                              {parseFloat(product.price).toLocaleString('vi-VN')}₫
                            </span>
                            <Badge className="text-xs bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full animate-pulse shadow-md w-fit">
                              🔥 Giảm {product.discount}%
                            </Badge>
                          </div>
                          {/* Discounted Price */}
                          <span className="text-3xl sm:text-4xl md:text-5xl font-black text-[#a10000] leading-none">
                            {(parseFloat(product.price) * (1 - product.discount / 100)).toLocaleString('vi-VN')}₫
                          </span>
                          {/* Savings Amount */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-green-600 font-semibold">
                              Tiết kiệm {(parseFloat(product.price) * (product.discount / 100)).toLocaleString('vi-VN')}₫
                            </span>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        </>
                      ) : (
                        /* No Discount - Show Regular Price */
                        <span className="text-3xl sm:text-4xl md:text-5xl font-black text-[#a10000] leading-none">
                          {parseFloat(product.price).toLocaleString('vi-VN')}₫
                        </span>
                      )}
                    </div>
                    
                     {/* Price Comparison */}
                     {product.discount && product.discount > 0 && (
                       <div className="md:text-right">
                         <div className="bg-white rounded-lg p-3 border border-red-200 shadow-sm">
                           <div className="text-xs text-gray-500 mb-1">Giá gốc</div>
                           <div className="text-base md:text-lg font-bold text-gray-700">
                             {parseFloat(product.price).toLocaleString('vi-VN')}₫
                           </div>
                           <div className="text-xs text-gray-500 mt-1">Giá sau giảm</div>
                           <div className="text-base md:text-lg font-bold text-[#a10000]">
                             {(parseFloat(product.price) * (1 - product.discount / 100)).toLocaleString('vi-VN')}₫
                           </div>
                         </div>
                       </div>
                     )}
                  </div>
                  
                  {/* Price Details */}
                  <div className="grid grid-cols-1 gap-2 md:gap-3 pt-3 md:pt-4 border-t border-red-200">
                    <div className="flex items-center gap-2 p-2 md:p-3 bg-white rounded-lg border border-green-200">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs md:text-sm font-semibold text-gray-900">Giá đã bao gồm VAT</div>
                        <div className="text-xs text-gray-600">Không phát sinh thêm phí</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 md:p-3 bg-white rounded-lg border border-blue-200">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Truck className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs md:text-sm font-semibold text-gray-900">Miễn phí vận chuyển</div>
                        <div className="text-xs text-gray-600">Cho đơn từ 1.000.000đ</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Benefits */}
                <ProductBenefits />

                {/* Product Details */}
                <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-gray-200 shadow-sm">
                  <CardContent className="p-3 md:p-4 lg:p-5">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 md:w-5 md:h-5 text-[#a10000]" />
                      Thông tin sản phẩm
                    </h3>
                    <div className="grid grid-cols-1 gap-2 md:gap-3">
                      {product.category && (
                        <div className="flex items-center justify-between p-2 md:p-3 bg-white rounded-lg border border-gray-100">
                          <span className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Package className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                            Danh mục:
                          </span>
                          <span className={cn(
                            "text-xs md:text-sm font-medium px-2 md:px-3 py-1 rounded-full border shadow-sm",
                            getCategoryBgColor(product.category.name, product.category.colorScheme),
                            getCategoryTextColor(product.category.name, product.category.colorScheme)
                          )}>
                            {product.category.name}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between p-2 md:p-3 bg-white rounded-lg border border-gray-100">
                        <span className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-2">
                          <Award className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
                          Loại sản phẩm:
                        </span>
                        <span className="text-xs md:text-sm text-gray-900 font-medium">
                          {product.type || 'Yến sào'}
                        </span>
                      </div>
                      
                      {product.weight && (
                        <div className="flex items-center justify-between p-2 md:p-3 bg-white rounded-lg border border-gray-100">
                          <span className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
                            Trọng lượng:
                          </span>
                          <span className="text-xs md:text-sm text-gray-900 font-medium">{product.weight}g</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between p-2 md:p-3 bg-white rounded-lg border border-gray-100">
                        <span className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                          Tình trạng:
                        </span>
                        <span className={`text-xs md:text-sm font-medium px-2 md:px-3 py-1 rounded-full border shadow-sm ${
                          (product.quantity || 0) > 0 
                            ? 'text-green-700 bg-green-100 border-green-200' 
                            : 'text-red-700 bg-red-100 border-red-200'
                        }`}>
                          {(product.quantity || 0) > 0 ? `Còn ${product.quantity} sản phẩm` : 'Hết hàng'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 md:p-3 bg-white rounded-lg border border-gray-100">
                        <span className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-2">
                          <Clock className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                          Thời gian giao:
                        </span>
                        <span className="text-xs md:text-sm text-gray-900 font-medium">2-4 ngày</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 md:p-3 bg-white rounded-lg border border-gray-100">
                        <span className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-2">
                          <Shield className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                          Bảo hành:
                        </span>
                        <span className="text-xs md:text-sm text-gray-900 font-medium">12 tháng</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quantity Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#a10000]" />
                    Số lượng:
                  </label>
                  <div className="flex items-center gap-2 md:gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 hover:bg-gray-50"
                    >
                      -
                    </Button>
                    <div className="w-14 md:w-16 h-9 md:h-10 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-gray-200">
                      <span className="text-base md:text-lg font-bold text-gray-900">{quantity}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.min(product.quantity || 0, quantity + 1))}
                      disabled={quantity >= (product.quantity || 0)}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 hover:bg-gray-50"
                    >
                      +
                    </Button>
                    <span className="text-xs md:text-sm text-gray-500 ml-2">
                      Còn {product.quantity || 0} sản phẩm
                    </span>
                  </div>
                </div>

                {/* Action Buttons - Desktop Only */}
                <div className="hidden md:block space-y-3">
                  <div className="flex gap-3">
                    <AddToCartButton
                      product={product}
                      disabled={product.quantity === 0}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 rounded-xl"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Thêm vào giỏ hàng
                    </AddToCartButton>
                    <Button
                      onClick={handleBuyNow}
                      disabled={product.quantity === 0}
                      className="flex-1 h-12 bg-gradient-to-r from-[#a10000] to-[#c41e3a] hover:from-[#8a0000] hover:to-[#a10000] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 rounded-xl"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Mua ngay
                    </Button>
                  </div>
                  
                  {product.quantity === 0 && (
                    <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 text-lg">⚠️</span>
                        </div>
                        <p className="text-sm text-red-700 font-semibold">
                          Sản phẩm này hiện đang hết hàng
                        </p>
                      </div>
                      <p className="text-xs text-red-600">
                        Vui lòng liên hệ để được thông báo khi có hàng
                      </p>
                    </div>
                  )}
                </div>



                {/* Description Preview */}
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-sm">
                  <CardContent className="p-3 md:p-4 lg:p-5">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                      Mô tả sản phẩm
                    </h3>
                    <div className="bg-white rounded-lg p-2 md:p-3 lg:p-4 border border-amber-100">
                      <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                        {product.description.length > 200 
                          ? `${product.description.substring(0, 200)}...` 
                          : product.description}
                      </p>
                      {product.description.length > 200 && (
                        <button 
                          className="text-xs md:text-sm text-amber-600 font-medium mt-2 hover:text-amber-700 transition-colors"
                          onClick={() => document.getElementById('product-details-tabs')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                          Xem thêm chi tiết →
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Product Details Tabs */}
        <div id="product-details-tabs" className="py-8 md:py-10">
          <ProductDetailsTabs product={product} />
        </div>

        {/* Reviews Section */}
        <div className="py-6 md:py-8 lg:py-10">
          <Card className="mb-6 md:mb-8 shadow-xl border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
            <CardHeader className="pb-4 md:pb-6 pt-6 md:pt-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#a10000] to-[#c41e3a] rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
                      Đánh giá khách hàng
                    </CardTitle>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">
                      Chia sẻ trải nghiệm của bạn với sản phẩm này
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4 bg-white rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-200 shadow-sm">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-[#a10000]">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 md:w-4 md:h-4 ${
                            star <= averageRating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs md:text-sm text-gray-600">
                      {product.reviews?.length || 0} đánh giá
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
            {/* Review Form for authenticated users */}
            {session?.user && !userHasReviewed ? (
              <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">Viết đánh giá</h4>
                      <p className="text-sm text-gray-600">Chia sẻ trải nghiệm của bạn</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-gray-700">Đánh giá của bạn</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="text-3xl hover:scale-110 transition-transform duration-200 p-1"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= reviewRating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300 hover:text-yellow-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {reviewRating > 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm font-medium text-yellow-800">
                            {reviewRating === 1 && '😞 Rất không hài lòng'}
                            {reviewRating === 2 && '😐 Không hài lòng'}
                            {reviewRating === 3 && '😊 Bình thường'}
                            {reviewRating === 4 && '😄 Hài lòng'}
                            {reviewRating === 5 && '🥰 Rất hài lòng'}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-gray-700">Nhận xét</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                        rows={4}
                        placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                      />
                    </div>
                    
                    <button
                      onClick={async () => {
                        if (reviewRating > 0 && reviewComment.trim()) {
                          setSubmitting(true);
                          try {
                            const newReview = await apiService.createReview({
                              productId: product.id,
                              rating: reviewRating,
                              comment: reviewComment,
                            });
                            
                            setLocalReviews([newReview, ...localReviews]);
                            setReviewRating(0);
                            setReviewComment('');
                            setSubmitMsg('Đánh giá đã được gửi thành công!');
                            toast.success('Đánh giá đã được gửi thành công!');
                            setTimeout(() => setSubmitMsg(''), 3000);
                          } catch (error) {
                            console.error('Error creating review:', error);
                            // Check if it's a duplicate review error
                            if (error instanceof Error && (error.message.includes('already reviewed') || error.message.includes('User has already reviewed'))) {
                              toast.error('Bạn đã đánh giá sản phẩm này rồi. Mỗi sản phẩm chỉ được đánh giá một lần.');
                            } else {
                              toast.error('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
                            }
                          } finally {
                            setSubmitting(false);
                          }
                        }
                      }}
                      disabled={submitting || reviewRating === 0 || !reviewComment.trim()}
                      className="w-full h-12 bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white font-semibold rounded-xl hover:from-[#8a0000] hover:to-[#a10000] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang gửi...
                        </div>
                      ) : (
                        'Gửi đánh giá'
                      )}
                    </button>
                    
                    {submitMsg && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                        <p className="text-sm text-green-700 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          {submitMsg}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Đăng nhập để viết đánh giá</h4>
                  <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto">
                    Chia sẻ trải nghiệm của bạn với sản phẩm này để giúp khách hàng khác đưa ra quyết định tốt hơn.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname))}
                      className="h-12 bg-gradient-to-r from-[#a10000] to-[#c41e3a] hover:from-[#8a0000] hover:to-[#a10000] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      Đăng nhập ngay
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/signup?callbackUrl=' + encodeURIComponent(window.location.pathname))}
                      className="h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
                    >
                      Tạo tài khoản
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User's Existing Review */}
            {userHasReviewed && userReview && (
              <Card className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">Đánh giá của bạn</h4>
                      <p className="text-sm text-gray-600">Bạn đã đánh giá sản phẩm này</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">Đánh giá:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= userReview.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {userReview.comment && (
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Nhận xét:</span>
                        <p className="text-sm text-gray-600 mt-1 p-3 bg-white rounded-lg border border-gray-200">
                          "{userReview.comment}"
                        </p>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Đánh giá vào: {new Date(userReview.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {(localReviews.length > 0 ? localReviews : product.reviews || []).map((review) => (
                <div key={review.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {(review.user?.name || 'K').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{review.user?.name || 'Khách hàng'}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#a10000]">
                        {review.rating}.0
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  )}
                </div>
              ))}
              
              {(!localReviews.length && !product.reviews?.length) && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-yellow-200">
                    <Star className="w-12 h-12 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Chưa có đánh giá nào</h3>
                  <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
                    Hãy là người đầu tiên đánh giá sản phẩm này và chia sẻ trải nghiệm của bạn!
                  </p>
                  {!session?.user && (
                    <Button 
                      onClick={() => router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname))}
                      className="h-12 bg-gradient-to-r from-[#a10000] to-[#c41e3a] hover:from-[#8a0000] hover:to-[#a10000] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      Đăng nhập để đánh giá
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </div>



        {/* Related Products */}
        <div className="py-12 md:py-16">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-white to-gray-50/50 rounded-3xl" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-[#a10000]/10 to-[#c41e3a]/10 rounded-full blur-3xl" />
            
            <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-8 py-12">
                <RelatedProducts currentProductId={product.id} categoryId={product.categoryId || ''} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Action Bar - Mobile & Tablet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
        <div className="p-3 space-y-3">
          {/* Out of Stock Message */}
          {product.quantity === 0 && (
            <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">⚠️</span>
                </div>
                <p className="text-xs text-red-700 font-semibold">
                  Sản phẩm này hiện đang hết hàng
                </p>
              </div>
            </div>
          )}
          {/* Action Buttons */}
          {(product.quantity || 0) > 0 && (
            <div className="flex gap-2">
              <AddToCartButton
                product={product}
                disabled={product.quantity === 0}
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 rounded-lg text-sm"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Thêm vào giỏ
              </AddToCartButton>
              <Button
                onClick={handleBuyNow}
                disabled={product.quantity === 0}
                className="flex-1 h-12 bg-gradient-to-r from-[#a10000] to-[#c41e3a] hover:from-[#8a0000] hover:to-[#a10000] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 rounded-lg text-sm"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Mua ngay
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Common Footer */}
      <Footer />
    </div>
  );
}



// Tabbed details component for mobile-first UI
function ProductDetailsTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState('desc');
  const tabList = [
    { key: 'desc', label: 'Mô tả', icon: Award },
    { key: 'ingredients', label: 'Thành phần', icon: Package },
    { key: 'usage', label: 'Cách sử dụng', icon: Clock },
    { key: 'preservation', label: 'Bảo quản', icon: Shield },
  ];
  
  return (
    <Card className="mb-6 shadow-xl border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
      <CardHeader className="pb-3 md:pb-4 pt-4 md:pt-6">
        <CardTitle className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2 md:gap-3">
          <div className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-[#a10000] to-[#c41e3a] rounded-full flex items-center justify-center flex-shrink-0">
            <Award className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <span className="leading-tight">Thông tin chi tiết sản phẩm</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 md:px-6 lg:px-8 pb-4 md:pb-6 lg:pb-8">
        {/* Modern Tab Navigation */}
        <div className="flex gap-2 md:gap-3 mb-4 md:mb-6 overflow-x-auto scrollbar-hide pb-2 pl-4 md:pl-6 lg:pl-8">
          {tabList.map((t) => {
            const IconComponent = t.icon;
            return (
              <button
                key={t.key}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 lg:px-6 py-2 md:py-3 text-xs md:text-sm font-medium rounded-lg md:rounded-xl transition-all duration-300 whitespace-nowrap border-2 flex-shrink-0 ${
                  tab === t.key 
                    ? 'bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white border-[#a10000] shadow-lg transform scale-105' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:scale-105'
                }`}
                onClick={() => setTab(t.key)}
                type="button"
              >
                <IconComponent className={`w-3 h-3 md:w-4 md:h-4 ${tab === t.key ? 'text-white' : 'text-gray-500'}`} />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.length > 3 ? t.label.substring(0, 3) : t.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Tab Content */}
        <div className="min-h-[150px] md:min-h-[200px]">
          {tab === 'desc' && (
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-3 h-3 md:w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Mô tả chi tiết</h3>
              </div>
              <div className="prose prose-sm text-gray-700 leading-relaxed max-w-none text-sm md:text-base">
                {product.description}
              </div>
            </div>
          )}
          
          {tab === 'ingredients' && (
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-3 h-3 md:w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Thành phần</h3>
              </div>
              <div className="space-y-3 md:space-y-4">
                <p className="text-sm md:text-base text-gray-700 font-medium">100% Yến sào nguyên chất, không chất phụ gia.</p>
                <div className="grid grid-cols-1 gap-2 md:gap-3">
                  {[
                    'Yến sào tự nhiên từ Kiên Giang',
                    'Không chất bảo quản',
                    'Không phẩm màu nhân tạo',
                    'Đảm bảo vệ sinh an toàn thực phẩm'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 md:p-3 bg-green-50 rounded-lg border border-green-100">
                      <CheckCircle className="w-3 h-3 md:w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-xs md:text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {tab === 'usage' && (
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Cách sử dụng</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Cách chế biến:</h4>
                  <ol className="space-y-3">
                    {[
                      'Ngâm yến sào trong nước ấm khoảng 30 phút',
                      'Rửa sạch và loại bỏ tạp chất',
                      'Chưng cách thủy với đường phèn hoặc mật ong',
                      'Ăn khi còn ấm để đạt hiệu quả tốt nhất'
                    ].map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-gray-700">
                    <strong>Lưu ý:</strong> Có thể chế biến với các nguyên liệu khác tùy theo sở thích.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {tab === 'preservation' && (
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Hướng dẫn bảo quản</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Bảo quản nơi khô ráo, thoáng mát',
                    'Tránh ánh nắng trực tiếp và độ ẩm cao',
                    'Đóng kín bao bì sau khi sử dụng',
                    'Sử dụng trong vòng 6 tháng kể từ ngày mở'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <Shield className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                  <p className="text-sm text-gray-700">
                    <strong>Nhiệt độ bảo quản:</strong> Dưới 25°C
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
