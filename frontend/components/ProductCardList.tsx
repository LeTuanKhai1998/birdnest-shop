'use client';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/types';

export function ProductCardList({ products }: { products: Product[] }) {
  return (
    <>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </>
  );
}
