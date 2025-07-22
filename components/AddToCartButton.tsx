import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { ReactNode } from "react";

export function AddToCartButton({ children, className }: { children: ReactNode; className?: string }) {
  const addToCart = useCartStore((s) => s.addToCart);
  return (
    <Button className={className} size="sm" onClick={addToCart} type="button">
      {children}
    </Button>
  );
} 