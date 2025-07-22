"use client";
import Image from "next/image";
import Link from "next/link";

export default function RelatedProducts({ currentProduct, products }: { currentProduct: any, products: any[] }) {
  const related = products.filter(
    p => p.type === currentProduct.type && p.name !== currentProduct.name
  );
  if (related.length === 0) return null;
  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold mb-4">Sản phẩm liên quan</h3>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {related.map(product => (
          <Link
            key={product.name}
            href={`/products/${product.name.toLowerCase().replace(/\s+/g, "-")}`}
            className="min-w-[200px] max-w-[220px] bg-white rounded-xl shadow hover:shadow-lg border p-3 flex flex-col items-center transition-all duration-200"
          >
            <div className="relative w-full h-36 mb-2">
              <Image
                src={product.images?.[0] || product.image}
                alt={product.name}
                fill
                className="object-contain w-full h-full rounded"
              />
            </div>
            <div className="font-medium text-center line-clamp-2 mb-1">{product.name}</div>
            <div className="text-red-700 font-bold mb-1 text-lg">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(product.price)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 