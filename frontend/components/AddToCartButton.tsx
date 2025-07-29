import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';
import { ReactNode } from 'react';
import { Product } from '@/components/ProductCard';

export function AddToCartButton({
  product,
  children,
  className,
  disabled,
}: {
  product: Product;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const addToCart = useCartStore((s) => s.addToCart);
  return (
    <Button
      className={className}
      size="sm"
      onClick={() => addToCart(product)}
      type="button"
      disabled={disabled}
    >
      {children}
    </Button>
  );
}
