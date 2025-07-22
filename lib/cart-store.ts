import { create } from "zustand";

interface CartState {
  cartCount: number;
  cartBounce: boolean;
  addToCart: () => void;
  triggerCartBounce: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cartCount: 2, // initial value for demo
  cartBounce: false,
  addToCart: () => set((state) => {
    // When adding to cart, also trigger bounce
    set({ cartBounce: true });
    setTimeout(() => set({ cartBounce: false }), 300);
    return { cartCount: state.cartCount + 1 };
  }),
  triggerCartBounce: () => {
    set({ cartBounce: true });
    setTimeout(() => set({ cartBounce: false }), 300);
  },
})); 