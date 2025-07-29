'use client';
import { useCartStore } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 container mx-auto px-2 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="text-4xl mb-4">🛒</span>
            <p className="text-lg text-gray-600 mb-4">Your cart is empty.</p>
            <Link href="/products">
              <Button variant="default">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 mb-8">
              {items.map(({ product, quantity }) => (
                <Card
                  key={product.id}
                  className="flex flex-col sm:flex-row items-center gap-4 p-4"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="block w-24 h-24 flex-shrink-0"
                  >
                    <AspectRatio
                      ratio={1 / 1}
                      className="rounded bg-gray-50 border overflow-hidden"
                    >
                      <Image
                        src={
                          product.image ||
                          (product.images && product.images[0]) ||
                          ''
                        }
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </AspectRatio>
                  </Link>
                  <div className="flex-1 flex flex-col gap-1 justify-center">
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-semibold text-base hover:underline line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <div className="text-sm text-gray-500">
                      {product.weight}g
                    </div>
                    <div className="font-bold text-red-700 text-lg">
                      {currencyFormatter.format(product.price)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        updateQuantity(product.id, Math.max(1, quantity - 1))
                      }
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="px-2 min-w-[2ch] text-center">
                      {quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFromCart(product.id)}
                    aria-label="Remove from cart"
                    className="text-red-600 ml-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </Card>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6">
              <div className="text-lg font-semibold">
                Subtotal:{' '}
                <span className="text-red-700">
                  {currencyFormatter.format(subtotal)}
                </span>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button variant="outline" onClick={clearCart}>
                  Clear Cart
                </Button>
                <Button variant="default" asChild>
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
