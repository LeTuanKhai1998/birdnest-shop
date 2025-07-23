import { create } from "zustand";

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
  setCheckoutInfo: (info: CheckoutInfo) => void;
  clearCheckoutInfo: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  info: null,
  setCheckoutInfo: (info) => set({ info }),
  clearCheckoutInfo: () => set({ info: null }),
})); 