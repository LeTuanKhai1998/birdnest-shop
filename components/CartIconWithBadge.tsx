import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCartStore, selectCartCount } from "@/lib/cart-store";
import { HydrationSafe } from "@/components/HydrationSafe";

export function CartIconWithBadge() {
  return (
    <HydrationSafe fallback={
      <Link href="/cart" className="relative">
        <div className="inline-block relative">
          <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-red-700 transition" />
        </div>
      </Link>
    }>
      <CartIconWithBadgeContent />
    </HydrationSafe>
  );
}

function CartIconWithBadgeContent() {
  const cartCount = useCartStore(selectCartCount);
  const cartBounce = useCartStore((s) => s.cartBounce);

  return (
    <Link href="/cart" className="relative">
      <div className="inline-block relative">
        <motion.div
          animate={cartBounce ? { scale: 1.15 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 18, duration: 0.25 }}
        >
          <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-red-700 transition" />
        </motion.div>
        {cartCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.5rem] text-center select-none shadow" style={{ zIndex: 1, transformOrigin: "center" }}>
            <motion.span
              key={cartCount}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: cartBounce ? 1.15 : 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 18, duration: 0.25 }}
            >
              {cartCount}
            </motion.span>
          </div>
        )}
      </div>
    </Link>
  );
} 