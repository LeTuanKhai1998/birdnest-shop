import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCartStore, selectCartCount } from "@/lib/cart-store";

export function CartIconWithBadge() {
  const cartCount = useCartStore(selectCartCount);
  const cartBounce = useCartStore((s) => s.cartBounce);

  return (
    <Link href="/cart" className="relative">
      <motion.span
        animate={cartBounce ? { scale: 1.15 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 18, duration: 0.25 }}
        className="inline-block relative"
        style={{ display: "inline-block" }}
      >
        <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-red-700 transition" />
        {cartCount > 0 && (
          <motion.span
            key={cartCount}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: cartBounce ? 1.15 : 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18, duration: 0.25 }}
            className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.5rem] text-center select-none shadow"
            style={{ zIndex: 1, transformOrigin: "center" }}
          >
            {cartCount}
          </motion.span>
        )}
      </motion.span>
    </Link>
  );
} 