'use client';
import { useCartStore } from '@/lib/cart-store';
import { getFirstImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, Package } from 'lucide-react';
import { useFreeShippingThreshold } from '@/lib/settings-context';
import { calculateShippingFee } from '@/lib/shipping-utils';
import { FreeShippingProgress } from '@/components/FreeShippingProgress';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const freeShippingThreshold = useFreeShippingThreshold();

  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0,
  );
  
  const shipping = calculateShippingFee(subtotal, freeShippingThreshold);
  const total = subtotal + shipping;
  
  const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white">
      {/* Hero Section */}
      <section className="relative w-full bg-[#a10000] overflow-hidden" style={{ minHeight: '300px' }}>
        <div className="relative z-10 flex items-center justify-center" style={{ minHeight: '300px' }}>
          <div className="text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <ShoppingCart className="w-8 h-8" />
              Giỏ Hàng
            </h1>
            <p className="text-lg md:text-xl mb-4">
              {items.length > 0 
                ? `Bạn có ${items.length} sản phẩm trong giỏ hàng`
                : 'Giỏ hàng của bạn đang trống'
              }
            </p>
          </div>
        </div>
      </section>

      {/* Cart Content Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {items.length === 0 ? (
            // Empty Cart State
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Giỏ hàng của bạn đang trống
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Hãy khám phá các sản phẩm yến sào chất lượng cao của chúng tôi
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-[#a10000] hover:bg-red-800">
                  <Link href="/products" className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Tiếp tục mua sắm
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/" className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Xem sản phẩm nổi bật
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            // Cart with Items
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Sản phẩm ({items.length})
                    </h2>
                  </div>
                  <div className="divide-y">
                    {items.map(({ product, quantity }) => (
                      <div key={product.id} className="p-6">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <Link
                            href={`/products/${product.slug}`}
                            className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24"
                          >
                            <div className="relative w-full h-full rounded-lg bg-gray-50 border overflow-hidden">
                              <Image
                                src={
                                  product.image ||
                                  getFirstImageUrl(product.images) ||
                                  '/images/placeholder-image.svg'
                                }
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 80px, 96px"
                              />
                            </div>
                          </Link>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <Link
                                  href={`/products/${product.slug}`}
                                  className="font-semibold text-gray-900 hover:text-[#a10000] transition-colors line-clamp-2"
                                >
                                  {product.name}
                                </Link>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {typeof product.weight === 'number' ? `${product.weight}g` : '100g'}
                                  </Badge>
                                  {product.categoryId && (
                                    <Badge variant="secondary" className="text-xs">
                                      Category
                                    </Badge>
                                  )}
                                </div>
                                <div className="font-bold text-[#a10000] text-lg mt-2">
                                  {currencyFormatter.format(parseFloat(product.price))}
                                </div>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center border rounded-lg">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() =>
                                      updateQuantity(product.id, Math.max(1, quantity - 1))
                                    }
                                    disabled={quantity <= 1}
                                    className="h-8 w-8 rounded-none border-r"
                                    aria-label="Giảm số lượng"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="px-3 py-1 min-w-[3ch] text-center text-sm font-medium">
                                    {quantity}
                                  </span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => updateQuantity(product.id, quantity + 1)}
                                    className="h-8 w-8 rounded-none border-l"
                                    aria-label="Tăng số lượng"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                                
                                {/* Remove Button */}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeFromCart(product.id)}
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  aria-label="Xóa khỏi giỏ hàng"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Tóm tắt đơn hàng
                    </h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tạm tính:</span>
                        <span className="font-medium">{currencyFormatter.format(subtotal)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phí vận chuyển:</span>
                        <span className="font-medium">
                          {shipping === 0 ? (
                            <span className="text-green-600">Miễn phí</span>
                          ) : (
                            currencyFormatter.format(shipping)
                          )}
                        </span>
                      </div>
                      
                      {/* Free Shipping Progress */}
                      <FreeShippingProgress cartTotal={subtotal} />
                      
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Tổng cộng:</span>
                          <span className="text-[#a10000]">{currencyFormatter.format(total)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-[#a10000] hover:bg-red-800 h-12 text-base font-semibold"
                        asChild
                      >
                        <Link href="/checkout">
                          Tiến hành thanh toán
                        </Link>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full h-12"
                        onClick={clearCart}
                      >
                        Xóa giỏ hàng
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full h-12"
                        asChild
                      >
                        <Link href="/products" className="flex items-center justify-center gap-2">
                          <ArrowLeft className="w-4 h-4" />
                          Tiếp tục mua sắm
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
