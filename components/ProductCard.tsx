import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Eye, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import ProductMeta from "@/components/ProductMeta";

export interface Review {
  user: string;
  rating: number;
  comment: string;
}

export interface Product {
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
  const slug = product.name.toLowerCase().replace(/\s+/g, "-");
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20, duration: 0.18 }}
      className="group cursor-pointer"
    >
      <Card className="h-full flex flex-col transition-shadow duration-200 hover:shadow-lg">
        <CardContent className="p-0">
          <Link href={`/products/${slug}`} prefetch={false} className="block">
            <AspectRatio ratio={4/3} className="overflow-hidden rounded-t-xl bg-gradient-to-b from-white via-gray-50 to-gray-100 border border-gray-200 shadow-sm">
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
        <div className="px-2 py-2 sm:px-4 sm:py-3 flex flex-col gap-1 flex-1">
          <div className="flex items-center justify-between">
            <Link href={`/products/${slug}`} prefetch={false} className="text-sm sm:text-base font-semibold line-clamp-2 mb-0 hover:underline">
              {product.name}
            </Link>
            <span className="text-xs text-gray-500 font-medium">{product.weight}g</span>
          </div>
          {/* Product meta: rating, sold, reviews */}
          <ProductMeta rating={product.reviews?.length ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length) : 4.8} reviewCount={product.reviews?.length ?? 120} soldCount={product.sold ?? 1500} />
          <div className="font-bold text-red-700 text-base sm:text-lg mb-1">{currencyFormatter.format(product.price)}</div>
          <div className="flex gap-2 mt-2">
            {/* Mobile: icon buttons, Desktop: text buttons */}
            <AddToCartButton className="flex-1 py-2 text-xs sm:text-sm md:hidden" >
              <ShoppingCart className="w-5 h-5" />
            </AddToCartButton>
            <Link href={`/products/${slug}`} prefetch={false} className="flex-1 py-2 text-xs sm:text-sm md:hidden border rounded bg-white flex items-center justify-center" aria-label="View Details">
              <Eye className="w-5 h-5" />
            </Link>
            <AddToCartButton className="flex-1 py-2 text-xs sm:text-sm hidden md:block">
              Add to Cart
            </AddToCartButton>
            <Link href={`/products/${slug}`} prefetch={false} className="flex-1 py-2 text-xs sm:text-sm hidden md:block border rounded bg-white flex items-center justify-center" aria-label="View Details">
              View Details
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
} 