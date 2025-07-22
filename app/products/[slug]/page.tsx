"use client";

import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { AddToCartButton } from "@/components/AddToCartButton";
import Footer from "@/components/Footer";
import Image from "next/image";
import { products } from "@/lib/products-data";
import { notFound } from "next/navigation";

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  // For now, use product name slug (replace spaces with dashes, lowercase)
  const product = products.find(
    p => p.name.toLowerCase().replace(/\s+/g, "-") === params.slug
  );
  if (!product) return notFound();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 container mx-auto px-2 py-8 max-w-4xl">
        <Card className="p-4 md:p-8 flex flex-col md:flex-row gap-8 shadow-lg">
          {/* Image gallery placeholder */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <AspectRatio ratio={4/3} className="w-full max-w-md rounded-xl overflow-hidden bg-gradient-to-b from-white via-gray-50 to-gray-100 border border-gray-200 shadow-sm">
              <Image src={product.image} alt={product.name} fill className="object-contain w-full h-full" />
            </AspectRatio>
            {/* TODO: Add thumbnail gallery here */}
          </div>
          {/* Product info */}
          <div className="flex-1 flex flex-col gap-4 justify-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
            <div className="text-lg text-gray-500 mb-2">{product.weight}g</div>
            <div className="text-2xl font-bold text-red-700 mb-4">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(product.price)}</div>
            <div className="text-base text-gray-700 mb-4">{product.description}</div>
            {/* Add to Cart */}
            <AddToCartButton className="w-full md:w-auto">Add to Cart</AddToCartButton>
            {/* TODO: Add stock status, reviews, etc. */}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
} 