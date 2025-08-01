'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddToCartButton } from '@/components/AddToCartButton';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Home, ChevronRight, Truck, Shield, Clock, Heart, ShoppingCart } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Adapter function to convert API product to component product
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptProduct(apiProduct: any): Product {
  return {
    id: apiProduct.id,
    slug: apiProduct.slug,
    name: apiProduct.name,
    image: apiProduct.image,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    images: apiProduct.images?.map((img: any) => img.url) || [],
    price: apiProduct.price,
    weight: apiProduct.weight,
    description: apiProduct.description,
    quantity: apiProduct.quantity,
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
        <meta property="og:image" content={product.images[0]} />
      )}
      <meta property="product:price:amount" content={product.price.toString()} />
      <meta property="product:price:currency" content="VND" />
    </>
  );
}

// Breadcrumbs component
function Breadcrumbs({ product }: { product: Product }) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
      <Link href="/" className="flex items-center hover:text-[#a10000] transition-colors">
        <Home className="w-4 h-4 mr-1" />
        Trang chủ
      </Link>
      <ChevronRight className="w-4 h-4" />
      <Link href="/products" className="hover:text-[#a10000] transition-colors">
        Sản phẩm
      </Link>
      {product.category && (
        <>
          <ChevronRight className="w-4 h-4" />
          <Link 
            href={`/products?categoryId=${product.category.id}`} 
            className="hover:text-[#a10000] transition-colors"
          >
            {product.category.name}
          </Link>
        </>
      )}
      <ChevronRight className="w-4 h-4" />
      <span className="text-gray-900 font-medium truncate">{product.name}</span>
    </nav>
  );
}

// Product benefits section
function ProductBenefits() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="flex items-center gap-2 text-sm">
        <Truck className="w-4 h-4 text-green-600" />
        <span>Miễn phí vận chuyển</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Shield className="w-4 h-4 text-blue-600" />
        <span>Đảm bảo chất lượng</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4 text-orange-600" />
        <span>Giao hàng nhanh</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Shield className="w-4 h-4 text-purple-600" />
        <span>Thanh toán an toàn</span>
      </div>
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
  
  // State for product data
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Review form state (local-only for now, will be connected to backend later)
  const [reviewRating, setReviewRating] = React.useState(0);
  const [reviewComment, setReviewComment] = React.useState('');
  const [localReviews, setLocalReviews] = React.useState<Review[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitMsg, setSubmitMsg] = React.useState('');
  
  // Hooks that need to be called unconditionally
  const { data: session } = useSession();
  const { isInWishlist, add, remove, loading: wishlistLoading, mutate } = useWishlist();
  const shouldReduceMotion = useReducedMotion();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await apiService.getProductBySlug(decodedSlug);
        setProduct(adaptProduct(productData));
        // Update local reviews when product loads
        setLocalReviews(productData?.reviews || []);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
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
          <div className="animate-pulse">
            {/* Breadcrumbs skeleton */}
            <div className="flex items-center space-x-2 mb-8">
              <div className="bg-gray-200 h-4 w-16 rounded"></div>
              <div className="bg-gray-200 h-4 w-4 rounded"></div>
              <div className="bg-gray-200 h-4 w-20 rounded"></div>
            </div>
            
            {/* Main content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 h-96 rounded-lg"></div>
              <div className="space-y-4">
                <div className="bg-gray-200 h-8 rounded w-3/4"></div>
                <div className="bg-gray-200 h-6 rounded w-1/2"></div>
                <div className="bg-gray-200 h-4 rounded w-full"></div>
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
        <Card className="mb-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Gallery */}
              <div className="space-y-4">
                <ProductImageGallery images={product.images} productName={product.name} />
                <MoreImagesGallery product={product} />
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Product Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                      {product.name}
                    </h1>
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
                              className={`rounded-full bg-white/90 shadow p-2 hover:bg-red-50 transition-colors border border-gray-200 ${favorited ? 'text-red-600' : 'text-gray-400 hover:text-red-500'}`}
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
                                  className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`}
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

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= averageRating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {averageRating.toFixed(1)} ({product.reviews?.length || 0} đánh giá)
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl md:text-4xl font-bold text-[#a10000]">
                      {parseFloat(product.price).toLocaleString('vi-VN')}₫
                    </span>
                    {product.discount && product.discount > 0 && (
                      <span className="text-lg text-gray-500 line-through">
                        {((parseFloat(product.price) / (1 - product.discount / 100))).toLocaleString('vi-VN')}₫
                      </span>
                    )}
                  </div>
                  {product.discount && product.discount > 0 && (
                    <Badge className="text-sm bg-red-500 text-white">
                      Giảm {product.discount}%
                    </Badge>
                  )}
                </div>

                {/* Product Benefits */}
                <ProductBenefits />

                {/* Product Details */}
                <Card className="bg-gray-50/50 border-gray-200">
                  <CardContent className="p-4 space-y-3">
                    {product.category && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Danh mục:</span>
                        <span className="text-sm text-[#a10000] font-medium bg-red-50 px-2 py-1 rounded-full">
                          {product.category.name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Loại:</span>
                      <span className="text-sm text-gray-900">{product.type}</span>
                    </div>
                    {product.weight && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Trọng lượng:</span>
                        <span className="text-sm text-gray-900">{product.weight}g</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Tình trạng:</span>
                      <span className={`text-sm font-medium ${(product.quantity || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(product.quantity || 0) > 0 ? `Còn ${product.quantity} sản phẩm` : 'Hết hàng'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Quantity Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Số lượng:</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.min(product.quantity || 0, quantity + 1))}
                      disabled={quantity >= (product.quantity || 0)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <AddToCartButton
                      product={product}
                      disabled={product.quantity === 0}
                      className="flex-1"
                    >
                      Thêm vào giỏ hàng
                    </AddToCartButton>
                    <Button
                      onClick={handleBuyNow}
                      disabled={product.quantity === 0}
                      className="flex-1 bg-[#a10000] hover:bg-[#8a0000]"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Mua ngay
                    </Button>
                  </div>
                  
                  {product.quantity === 0 && (
                    <p className="text-sm text-red-600 text-center">
                      Sản phẩm này hiện đang hết hàng
                    </p>
                  )}
                </div>

                {/* Description Preview */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Mô tả</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {product.description.length > 200 
                      ? `${product.description.substring(0, 200)}...` 
                      : product.description}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Product Details Tabs */}
        <div className="py-12">
          <ProductDetailsTabs product={product} />
        </div>

        {/* Reviews Section */}
        <div className="py-12">
          <Card className="mb-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-6 pt-6">
              <CardTitle className="text-xl font-semibold">Đánh giá khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
            {/* Review Form for authenticated users */}
            {session?.user ? (
              <Card className="mb-6 bg-gray-50/50 border-gray-200">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Viết đánh giá</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Đánh giá</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="text-2xl hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= reviewRating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nhận xét</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#a10000] focus:border-transparent"
                        rows={3}
                        placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (reviewRating > 0 && reviewComment.trim()) {
                          setSubmitting(true);
                                                  // Simulate API call
                        setTimeout(() => {
                          const newReview: Review = {
                            id: Date.now().toString(),
                            userId: session.user?.id || '',
                            productId: product.id,
                            rating: reviewRating,
                            comment: reviewComment,
                            createdAt: new Date().toISOString(),
                            user: {
                              id: session.user?.id || '',
                              name: session.user?.name || 'Khách hàng',
                            },
                          };
                          setLocalReviews([newReview, ...localReviews]);
                          setReviewRating(0);
                          setReviewComment('');
                          setSubmitMsg('Đánh giá đã được gửi thành công!');
                          setSubmitting(false);
                          toast.success('Đánh giá đã được gửi thành công!');
                          setTimeout(() => setSubmitMsg(''), 3000);
                        }, 1000);
                        }
                      }}
                      disabled={submitting || reviewRating === 0 || !reviewComment.trim()}
                      className="px-4 py-2 bg-[#a10000] text-white rounded-md hover:bg-[#8a0000] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                    {submitMsg && (
                      <p className="text-sm text-green-600">{submitMsg}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Đăng nhập để viết đánh giá</h4>
                  <p className="text-gray-600 mb-4 text-sm">
                    Chia sẻ trải nghiệm của bạn với sản phẩm này để giúp khách hàng khác đưa ra quyết định tốt hơn.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname))}
                      className="bg-[#a10000] hover:bg-[#8a0000] text-white"
                    >
                      Đăng nhập ngay
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/signup?callbackUrl=' + encodeURIComponent(window.location.pathname))}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Tạo tài khoản
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {(localReviews.length > 0 ? localReviews : product.reviews || []).map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2">
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
                    <span className="text-sm font-medium">{review.user?.name || 'Khách hàng'}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700">{review.comment}</p>
                  )}
                </div>
              ))}
              
              {(!localReviews.length && !product.reviews?.length) && (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg font-medium mb-2">Chưa có đánh giá nào</p>
                  <p className="text-gray-400 text-sm">
                    Hãy là người đầu tiên đánh giá sản phẩm này!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </div>



        {/* Related Products */}
        <RelatedProducts currentProductId={product.id} categoryId={product.categoryId || ''} />
      </main>
    </div>
  );
}

function MoreImagesGallery({ product }: { product: Product }) {
  const moreImages = product.images || [];
  const [open, setOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  if (moreImages.length === 0) return null;
  return (
    <div className="mt-4">
      <h3 className="text-base font-semibold mb-2 text-gray-900">Hình ảnh khác</h3>
      <div className="overflow-x-auto max-w-full scroll-smooth snap-x px-2 pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="flex gap-2 w-max">
          {moreImages.map((img: string, i: number) => (
            <button
              key={img}
              className="relative w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 group snap-start hover:border-[#a10000] transition-colors"
              onClick={() => {
                setSelectedIdx(i);
                setOpen(true);
              }}
            >
              <Image
                src={img}
                alt={product.name + ' gallery ' + (i + 1)}
                fill
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
              />
            </button>
          ))}
        </div>
      </div>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          {open && (
            <div
              className="fixed inset-0 bg-black/80 z-50 transition-opacity duration-300 animate-fadeIn cursor-pointer"
              aria-label="Close image zoom"
              tabIndex={-1}
              onClick={() => setOpen(false)}
            />
          )}
          <DialogPrimitive.Content
            className="fixed inset-0 flex items-center justify-center z-50 outline-none transition-transform duration-300 animate-zoomIn p-0 w-screen h-screen max-w-full max-h-full"
            onPointerDownOutside={() => setOpen(false)}
          >
            <div className="sr-only">
              Product Image Gallery
            </div>
            <div className="relative bg-white rounded-xl shadow-lg w-full h-full max-w-full max-h-full flex flex-col animate-fadeInContent">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-2 right-2 z-10 bg-white/80 rounded-full p-2 hover:bg-white transition"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center justify-between px-2 pt-2">
                <span className="text-xs text-gray-500 mx-auto">
                  {selectedIdx + 1}/{moreImages.length}
                </span>
              </div>
              {/* Desktop center arrows */}
              <button
                onClick={() =>
                  setSelectedIdx(
                    (selectedIdx - 1 + moreImages.length) % moreImages.length,
                  )
                }
                className="hidden md:flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition"
                style={{ pointerEvents: 'auto' }}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8 text-gray-700" />
              </button>
              <button
                onClick={() =>
                  setSelectedIdx((selectedIdx + 1) % moreImages.length)
                }
                className="hidden md:flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition"
                style={{ pointerEvents: 'auto' }}
                aria-label="Next image"
              >
                <ChevronRightIcon className="w-8 h-8 text-gray-700" />
              </button>
              <div className="relative w-full flex-1 flex items-center justify-center select-none">
                <AnimatePresence initial={false} custom={selectedIdx}>
                  <motion.div
                    {...{
                      key: selectedIdx,
                      className:
                        'absolute inset-0 flex items-center justify-center w-full h-full',
                      drag: 'x',
                      dragConstraints: { left: 0, right: 0 },
                      onDragEnd: (event, info) => {
                        if (info.offset.x < -80)
                          setSelectedIdx((selectedIdx + 1) % moreImages.length);
                        else if (info.offset.x > 80)
                          setSelectedIdx(
                            (selectedIdx - 1 + moreImages.length) %
                              moreImages.length,
                          );
                      },
                      initial: { opacity: 0, x: 100 },
                      animate: { opacity: 1, x: 0 },
                      exit: { opacity: 0, x: -100 },
                      transition: {
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      },
                    }}
                  >
                    <Image
                      src={moreImages[selectedIdx]}
                      alt="Zoomed"
                      fill
                      className="object-contain w-full h-full rounded-xl transition-transform duration-300"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}

// Tabbed details component for mobile-first UI
function ProductDetailsTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState('desc');
  const tabList = [
    { key: 'desc', label: 'Mô tả' },
    { key: 'ingredients', label: 'Thành phần' },
    { key: 'usage', label: 'Cách sử dụng' },
    { key: 'preservation', label: 'Bảo quản' },
  ];
  return (
    <Card className="mb-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-6 pt-6">
        <CardTitle className="text-xl font-semibold">Thông tin chi tiết</CardTitle>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <div className="flex gap-2 md:gap-4 border-b border-gray-200 mb-6 overflow-x-auto">
          {tabList.map((t) => (
            <button
              key={t.key}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-150 whitespace-nowrap
                ${tab === t.key ? 'bg-[#a10000] text-white shadow-md font-semibold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'}`}
              onClick={() => setTab(t.key)}
              type="button"
              tabIndex={tab === t.key ? 0 : -1}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="min-h-[120px] text-sm md:text-base">
          {tab === 'desc' && (
            <div className="prose prose-sm text-gray-700 leading-relaxed">
              {product.description}
            </div>
          )}
          {tab === 'ingredients' && (
            <div className="text-gray-700 space-y-2">
              <p>100% Yến sào nguyên chất, không chất phụ gia.</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Yến sào tự nhiên từ Kiên Giang</li>
                <li>Không chất bảo quản</li>
                <li>Không phẩm màu nhân tạo</li>
                <li>Đảm bảo vệ sinh an toàn thực phẩm</li>
              </ul>
            </div>
          )}
          {tab === 'usage' && (
            <div className="text-gray-700 space-y-3">
              <p><strong>Cách chế biến:</strong></p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Ngâm yến sào trong nước ấm khoảng 30 phút</li>
                <li>Rửa sạch và loại bỏ tạp chất</li>
                <li>Chưng cách thủy với đường phèn hoặc mật ong</li>
                <li>Ăn khi còn ấm để đạt hiệu quả tốt nhất</li>
              </ol>
              <p className="text-sm text-gray-600 mt-4">
                <strong>Lưu ý:</strong> Có thể chế biến với các nguyên liệu khác tùy theo sở thích.
              </p>
            </div>
          )}
          {tab === 'preservation' && (
            <div className="text-gray-700 space-y-3">
              <p><strong>Hướng dẫn bảo quản:</strong></p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Bảo quản nơi khô ráo, thoáng mát</li>
                <li>Tránh ánh nắng trực tiếp và độ ẩm cao</li>
                <li>Đóng kín bao bì sau khi sử dụng</li>
                <li>Sử dụng trong vòng 6 tháng kể từ ngày mở</li>
              </ul>
              <p className="text-sm text-gray-600 mt-4">
                <strong>Nhiệt độ bảo quản:</strong> Dưới 25°C
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
