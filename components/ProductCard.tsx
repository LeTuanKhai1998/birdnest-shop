import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Eye, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export interface Product {
  name: string;
  image: string;
  price: number;
  weight: number;
  description: string;
  type?: string; // Added for filtering and consistency
}

export function ProductCard({ product }: { product: Product }) {
  const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20, duration: 0.18 }}
      className="group cursor-pointer"
    >
      <Card className="h-full flex flex-col transition-shadow duration-200 hover:shadow-lg">
        <CardContent className="p-0">
          <AspectRatio ratio={4/3} className="overflow-hidden rounded-t-xl bg-gradient-to-b from-white via-gray-50 to-gray-100 border border-gray-200 shadow-sm">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain w-full h-full group-hover:opacity-90 transition duration-200"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </AspectRatio>
        </CardContent>
        <div className="px-2 py-2 sm:px-4 sm:py-3 flex flex-col gap-1 flex-1">
          <div className="flex items-center justify-between">
            <div className="text-sm sm:text-base font-semibold line-clamp-2 mb-0">
              {product.name}
            </div>
            <span className="text-xs text-gray-500 font-medium">{product.weight}g</span>
          </div>
          <div className="font-bold text-red-700 text-base sm:text-lg mb-1">{currencyFormatter.format(product.price)}</div>
          <div className="flex gap-2 mt-2">
            {/* Mobile: icon buttons, Desktop: text buttons */}
            <AddToCartButton className="flex-1 py-2 text-xs sm:text-sm md:hidden" >
              <ShoppingCart className="w-5 h-5" />
            </AddToCartButton>
            <button className="flex-1 py-2 text-xs sm:text-sm md:hidden border rounded bg-white" aria-label="View Details">
              <Eye className="w-5 h-5" />
            </button>
            <AddToCartButton className="flex-1 py-2 text-xs sm:text-sm hidden md:block">
              Add to Cart
            </AddToCartButton>
            <button className="flex-1 py-2 text-xs sm:text-sm hidden md:block border rounded bg-white" aria-label="View Details">
              View Details
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
} 