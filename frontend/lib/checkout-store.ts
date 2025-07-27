import { create } from "zustand";
import { CartItem } from "@/lib/cart-store";

export interface CheckoutInfo {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  apartment?: string;
  note?: string;
}

interface CheckoutState {
  info: CheckoutInfo | null;
  products: CartItem[];
  deliveryFee: number;
  paymentMethod: string;
  setCheckoutInfo: (info: CheckoutInfo) => void;
  setProducts: (products: CartItem[]) => void;
  setDeliveryFee: (fee: number) => void;
  setPaymentMethod: (method: string) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  info: null,
  products: [],
  deliveryFee: 0,
  paymentMethod: "",
  setCheckoutInfo: (info) => set({ info }),
  setProducts: (products) => set({ products }),
  setDeliveryFee: (fee) => set({ deliveryFee: fee }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  clearCheckout: () => set({ info: null, products: [], deliveryFee: 0, paymentMethod: "" }),
})); 