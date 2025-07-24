import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Eye, ShoppingCart, Heart } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import ProductMeta from "@/components/ProductMeta";
import { useWishlist } from "@/lib/wishlist-store";
import { useSession } from "next-auth/react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useReducedMotion } from "framer-motion";

export interface Review {
  user: string;
  rating: number;
  comment: string;
}

export interface Product {
  id: string; // Unique product ID
  slug: string; // URL-safe unique slug for product detail page
  name: string;
  image?: string; // fallback for compatibility
  images?: string[]; // new: array of images for gallery
  price: number;
  weight: number;
  description: string;
  type?: string; // Added for filtering and consistency
  quantity?: number; // Stock quantity for status
  reviews?: Review[]; // Mock reviews
  sold?: number; // Added for sold count
}

export function ProductCard({ product }: { product: Product }) {
  const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
  const { data: session } = useSession();
  const { isInWishlist, add, remove, loading } = useWishlist();
  const favorited = isInWishlist(product.id);
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20, duration: 0.18 }}
      className="group cursor-pointer"
    >
      <Card className="h-full flex flex-col transition-shadow duration-200 hover:shadow-lg min-w-0">
        <CardContent className="p-0 min-w-0 relative">
          {/* Wishlist Heart Button */}
          {session?.user && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={favorited ? "Remove from Wishlist" : "Add to Wishlist"}
                    className={`absolute top-2 right-2 z-10 rounded-full bg-white/90 shadow p-1.5 hover:bg-red-50 transition-colors border border-gray-200 ${favorited ? "text-red-600" : "text-gray-400 hover:text-red-500"}`}
                    onClick={e => {
                      e.preventDefault();
                      if (loading) return;
                      favorited ? remove(product.id) : add(product);
                    }}
                    disabled={loading}
                  >
                    <motion.span
                      initial={false}
                      animate={favorited ? {
                        scale: [1, 1.3, 0.95, 1.1, 1],
                        opacity: [1, 1, 1, 1, 1],
                        rotate: [0, 10, -10, 0, 0],
                        color: "#dc2626"
                      } : {
                        scale: [1, 0.8, 1],
                        opacity: [1, 0.7, 1],
                        rotate: [0, -10, 0],
                        color: "#a3a3a3"
                      }}
                      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35, times: [0, 0.2, 0.5, 0.8, 1], ease: "easeInOut" }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.85 }}
                    >
                      <Heart fill={favorited ? "#dc2626" : "none"} className="w-6 h-6" />
                    </motion.span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>{favorited ? "Remove from Wishlist" : "Add to Wishlist"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Link href={`/products/${product.slug}`} prefetch={false} className="block min-w-0">
            <AspectRatio ratio={1/1} className="overflow-hidden rounded-t-xl bg-gradient-to-b from-white via-gray-50 to-gray-100 border border-gray-200 shadow-sm min-w-0">
              <Image
                src={product.image || (product.images && product.images[0]) || ""}
                alt={product.name}
                fill
                className="object-cover w-full h-full group-hover:opacity-90 transition duration-200"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </AspectRatio>
          </Link>
        </CardContent>
        <div className="px-2 py-2 sm:px-4 sm:py-3 flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 min-h-[2.2rem] min-w-0">
            <Link href={`/products/${product.slug}`} prefetch={false} className="text-sm sm:text-base font-semibold line-clamp-2 mb-0 hover:underline flex-1 min-w-0 truncate">
              {product.name}
            </Link>
            <span className="text-xs text-gray-500 font-medium flex-shrink-0">{product.weight}g</span>
          </div>
          {/* Product meta: rating, sold, reviews */}
          <ProductMeta rating={product.reviews?.length ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length) : 4.8} reviewCount={product.reviews?.length ?? 120} soldCount={product.sold ?? 1500} className="flex-wrap gap-x-2 gap-y-1 min-w-0" />
          <div className="font-bold text-red-700 text-base sm:text-lg mb-1 whitespace-nowrap min-w-0">{currencyFormatter.format(product.price)}</div>
          <div className="flex flex-wrap gap-2 mt-2 w-full min-w-0">
            {/* Mobile: icon buttons, Desktop: text buttons */}
            <AddToCartButton product={product} className="flex-1 py-2 text-xs sm:text-sm md:hidden min-w-[120px] basis-0" >
              <ShoppingCart className="w-5 h-5" />
            </AddToCartButton>
            <Link href={`/products/${product.slug}`} prefetch={false} className="flex-1 py-2 text-xs sm:text-sm md:hidden border rounded bg-white flex items-center justify-center min-w-[120px] basis-0" aria-label="View Details">
              <Eye className="w-5 h-5" />
            </Link>
            <AddToCartButton product={product} className="flex-1 py-2 text-xs sm:text-sm hidden md:block min-w-[120px] basis-0">
              Add to Cart
            </AddToCartButton>
            <Link
              href={`/products/${product.slug}`}
              prefetch={false}
              className="flex-1 py-2 text-xs sm:text-sm hidden md:block border rounded-md bg-white flex items-center justify-center text-center font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 h-10 min-w-[120px] basis-0"
              aria-label="View Details"
            >
              View Details
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
} 