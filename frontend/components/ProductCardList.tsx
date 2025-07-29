'use client';
import { ProductCard } from '@/components/ProductCard';

interface Product {
  id: string;
  slug: string;
  name: string;
  image: string;
  images: string[];
  price: number;
  weight: number;
  description: string;
  type: string;
  quantity: number;
  reviews: { user: string; rating: number; comment: string }[];
  sold: number;
}

export function ProductCardList({ products }: { products: Product[] }) {
  return (
    <>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </>
  );
}
