'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/components/ProductCard';
import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';

export default function RelatedProducts({
  currentProductId,
  categoryId,
}: {
  currentProductId: string;
  categoryId: string;
}) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        // Fetch products from the same category, excluding the current product
        const products = await apiService.getProducts({ categoryId });
        const filtered = products.filter(p => p.id !== currentProductId).slice(0, 4);
        setRelatedProducts(filtered);
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchRelatedProducts();
    }
  }, [currentProductId, categoryId]);

  if (loading) {
    return (
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-4">Related Products</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[200px] max-w-[220px] bg-white rounded-xl shadow border p-3 flex flex-col items-center animate-pulse">
              <div className="w-full h-36 bg-gray-200 rounded mb-2"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded mb-1"></div>
              <div className="w-1/2 h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold mb-4">Related Products</h3>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {relatedProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="min-w-[200px] max-w-[220px] bg-white rounded-xl shadow hover:shadow-lg border p-3 flex flex-col items-center transition-all duration-200"
          >
            <div className="relative w-full h-36 mb-2">
              <Image
                src={
                  product.images?.[0] ||
                  product.image ||
                  '/images/placeholder.png'
                }
                alt={product.name}
                fill
                className="object-contain w-full h-full rounded"
              />
            </div>
            <span className="block text-sm font-medium text-primary hover:underline">
              {product.name}
            </span>
            <div className="text-red-700 font-bold mb-1 text-lg">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0,
              }).format(product.price)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
