import { create } from "zustand";
import useSWR from "swr/immutable";
import { fetcher } from "@/lib/utils";
import { Product } from "@/components/ProductCard";

export interface WishlistItem {
  id: string;
  product: Product;
  productId: string;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  add: (product: Product, mutate: () => void) => Promise<void>;
  remove: (productId: string, mutate: () => void) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  add: async (product, mutate) => {
    set({ loading: true, error: null });
    const prev = get().items;
    set({ items: [...prev, { id: "optimistic-" + product.id, product, productId: product.id }] });
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (!res.ok) throw new Error(await res.text());
      mutate();
    } catch (e: any) {
      set({ items: prev, error: e.message });
    } finally {
      set({ loading: false });
    }
  },
  remove: async (productId, mutate) => {
    set({ loading: true, error: null });
    const prev = get().items;
    set({ items: prev.filter((item) => item.productId !== productId) });
    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error(await res.text());
      mutate();
    } catch (e: any) {
      set({ items: prev, error: e.message });
    } finally {
      set({ loading: false });
    }
  },
  isInWishlist: (productId) => get().items.some((item) => item.productId === productId),
}));

// SWR hook for fetching wishlist
export function useWishlist() {
  const { data, error, isLoading, mutate } = useSWR<WishlistItem[]>("/api/wishlist", fetcher);
  const store = useWishlistStore();
  // Sync Zustand store with SWR data
  if (data && store.items !== data) {
    store.items = data;
  }
  return {
    items: data || [],
    loading: isLoading,
    error,
    mutate,
    add: (product: Product) => store.add(product, mutate),
    remove: (productId: string) => store.remove(productId, mutate),
    isInWishlist: store.isInWishlist,
  };
} 