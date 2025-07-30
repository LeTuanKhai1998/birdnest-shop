'use client';
import { LoadingOrEmpty } from '@/components/ui/LoadingOrEmpty';
import { useWishlist } from '@/lib/wishlist-store';
import { ProductCard } from '@/components/ProductCard';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { items, loading } = useWishlist();
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 
          className="text-glossy text-3xl md:text-5xl font-black italic"
          style={{
            fontWeight: 900,
            fontStyle: 'italic',
            fontFamily: 'Inter, sans-serif',
            fontSize: '3.3rem',
            padding: '20px',
            color: '#a10000'
          }}
        >
          Danh sách yêu thích
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Lưu trữ và quản lý các sản phẩm bạn yêu thích
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#a10000]">
            Sản phẩm yêu thích ({items.length})
          </h2>
          <Link
            href="/products"
            className="inline-block bg-glossy text-red-900 font-bold px-6 py-3 rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 hover:shadow-3xl animate-button-zoom button-glow text-sm"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}
          >
            <ShoppingBag className="w-4 h-4 mr-2 inline" />
            Mua sắm thêm
          </Link>
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
                <Link
                  href="/products"
                  className="inline-block bg-glossy text-red-900 font-bold px-6 py-3 rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 hover:shadow-3xl animate-button-zoom button-glow text-sm"
                  style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}
                >
                  <ShoppingBag className="w-4 h-4 mr-2 inline" />
                  Khám phá sản phẩm
                </Link>
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
