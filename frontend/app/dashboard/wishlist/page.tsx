"use client";
import { LoadingOrEmpty } from "@/components/ui/LoadingOrEmpty";
import { useWishlist } from "@/lib/wishlist-store";
import { ProductCard } from "@/components/ProductCard";

export default function WishlistPage() {
  const { items, loading } = useWishlist();
  return (
    <div className="py-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Danh sách yêu thích</h2>
      <LoadingOrEmpty loading={loading} empty={items.length === 0} emptyText="Chưa có sản phẩm yêu thích nào.">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <ProductCard key={item.productId} product={item.product} />
          ))}
        </div>
      </LoadingOrEmpty>
    </div>
  );
} 