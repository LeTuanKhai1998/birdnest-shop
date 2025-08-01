'use client';
import { LoadingOrEmpty } from '@/components/ui/LoadingOrEmpty';
import { useWishlist } from '@/lib/wishlist-store';
import { ProductCard } from '@/components/ProductCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { items, loading } = useWishlist();
  
  return (
    <div className="space-y-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#a10000]">
            Sản phẩm yêu thích ({items.length})
          </h2>
          <Button asChild className="bg-[#a10000] hover:bg-red-800 h-11">
            <Link href="/products">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Mua sắm thêm
            </Link>
          </Button>
        </div>
        
        <LoadingOrEmpty
          loading={loading}
          empty={items.length === 0}
          emptyText="Chưa có sản phẩm yêu thích."
        >
          {items.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Danh sách yêu thích trống</h3>
                <p className="text-gray-600 mb-6">
                  Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy khám phá và thêm sản phẩm bạn thích!
                </p>
                <Button asChild className="bg-[#a10000] hover:bg-red-800 h-11">
                  <Link href="/products">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Khám phá sản phẩm
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <ProductCard key={item.productId} product={item.product} />
              ))}
            </div>
          )}
        </LoadingOrEmpty>
      </div>
    </div>
  );
}
