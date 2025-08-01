'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
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
        const filtered = products.filter((p: Product) => p.id !== currentProductId).slice(0, 4);
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
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="min-w-[200px] max-w-[220px] bg-white rounded-xl shadow border p-3 flex flex-col items-center animate-pulse">
            <div className="w-full h-36 bg-gray-200 rounded mb-2"></div>
            <div className="w-3/4 h-4 bg-gray-200 rounded mb-1"></div>
            <div className="w-1/2 h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (relatedProducts.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {relatedProducts.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          className="min-w-[200px] max-w-[220px] bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-100 p-4 flex flex-col items-center transition-all duration-200 hover:scale-105 group"
        >
          <div className="relative w-full h-36 mb-3">
            <Image
              src={
                product.images?.[0] ||
                product.image ||
                '/images/placeholder-image.svg'
              }
              alt={product.name}
              fill
              className="object-contain w-full h-full rounded-lg group-hover:scale-110 transition-transform duration-200"
            />
          </div>
          <span className="block text-sm font-medium text-gray-900 hover:text-[#a10000] transition-colors text-center line-clamp-2 mb-2">
            {product.name}
          </span>
          <div className="text-[#a10000] font-bold text-lg">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              maximumFractionDigits: 0,
            }).format(parseFloat(product.price))}
          </div>
        </Link>
      ))}
    </div>
  );
}
