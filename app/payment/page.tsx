"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/cart-store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCheckoutStore } from "@/lib/checkout-store";

const PAYMENT_METHODS = [
  { value: "stripe", label: "Credit/Debit Card (Stripe)" },
  { value: "momo", label: "Momo E-wallet" },
  { value: "bank", label: "ATM Bank Transfer" },
  { value: "cod", label: "Cash on Delivery (COD)" },
];

export default function PaymentPage() {
  const [method, setMethod] = useState("stripe");
  const [confirming, setConfirming] = useState(false);
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = subtotal >= 2000000 ? 0 : 30000;
  const total = subtotal + shippingFee;
  const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
  const checkoutInfo = useCheckoutStore((s) => s.info);
  const clearCart = useCartStore((s) => s.clearCart);
  const triggerCartBounce = useCartStore((s) => s.triggerCartBounce);
  const router = useRouter();

  // Helper to format address
  const formatAddress = (info: typeof checkoutInfo) => {
    if (!info) return "";
    return [info.province, info.district, info.ward, info.address, info.apartment].filter(Boolean).join(", ");
  };

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => {
      clearCart();
      triggerCartBounce();
      setConfirming(false);
      router.push("/order/mock123");
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 container mx-auto px-2 py-8 max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Payment</h1>
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Select Payment Method</h2>
          <RadioGroup value={method} onValueChange={setMethod} className="flex flex-col gap-3">
            {PAYMENT_METHODS.map((m) => (
              <div key={m.value} className="flex items-center gap-3">
                <RadioGroupItem value={m.value} id={m.value} />
                <label htmlFor={m.value} className="font-medium cursor-pointer">{m.label}</label>
              </div>
            ))}
          </RadioGroup>
          <div className="mt-6 transition-all animate-fade-in">
            {method === "stripe" && (
              <div className="space-y-2">
                <p>Pay securely with your credit or debit card via Stripe.</p>
                <Button disabled>Proceed with Stripe (mock)</Button>
              </div>
            )}
            {method === "momo" && (
              <div className="space-y-2 flex flex-col items-center">
                <p>Scan the QR code below with your Momo app to pay.</p>
                <Image src="/images/momo-qr-mock.png" alt="Momo QR" width={180} height={180} className="rounded border" />
                <p className="text-xs text-gray-500 mt-2">Order ID: <span className="font-mono">MOCK123</span></p>
                <Button onClick={handleConfirm} disabled={confirming}>{confirming ? "Confirming..." : "I have paid with Momo"}</Button>
              </div>
            )}
            {method === "bank" && (
              <div className="space-y-2">
                <p>Transfer to the following bank account:</p>
                <div className="bg-gray-50 rounded p-3 text-sm">
                  <div><span className="font-medium">Bank:</span> Vietcombank</div>
                  <div><span className="font-medium">Account No:</span> 0123456789</div>
                  <div><span className="font-medium">Account Name:</span> NGUYEN VAN A</div>
                  <div><span className="font-medium">Transfer Note:</span> MOCK123</div>
                </div>
                <Button onClick={handleConfirm} disabled={confirming}>{confirming ? "Confirming..." : "I have transferred"}</Button>
              </div>
            )}
            {method === "cod" && (
              <div className="space-y-2">
                <p>Pay with cash when your order is delivered to your address.</p>
                <Button onClick={handleConfirm} disabled={confirming}>{confirming ? "Confirming..." : "Confirm COD Order"}</Button>
              </div>
            )}
          </div>
        </Card>
        <Card className="p-6 mb-24">
          <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
          {/* User and Address Info */}
          {checkoutInfo && (
            <div className="mb-4 text-sm text-gray-700 space-y-1">
              <div><span className="font-medium">Name:</span> {checkoutInfo.fullName}</div>
              <div><span className="font-medium">Email:</span> {checkoutInfo.email}</div>
              <div><span className="font-medium">Phone:</span> {checkoutInfo.phone}</div>
              <div><span className="font-medium">Address:</span> {formatAddress(checkoutInfo)}</div>
            </div>
          )}
          <ul className="divide-y">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="py-2 flex items-center justify-between">
                <span>{product.name} <span className="text-xs text-gray-500">x{quantity}</span></span>
                <span className="font-semibold text-red-700">{currencyFormatter.format(product.price * quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between pt-4 border-t text-base">
            <span>Subtotal</span>
            <span>{currencyFormatter.format(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-base">
            <span>Shipping</span>
            <span>{shippingFee === 0 ? <span className="text-green-600 font-semibold">Free</span> : currencyFormatter.format(shippingFee)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t font-bold text-lg">
            <span>Total</span>
            <span className="text-red-700">{currencyFormatter.format(total)}</span>
          </div>
        </Card>
      </main>
      {/* Sticky bottom bar for confirm CTA on mobile */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg p-4 flex md:hidden z-40">
        <Button className="w-full text-base font-semibold py-3" onClick={handleConfirm} disabled={confirming}>
          {confirming ? "Processing..." : method === "stripe" ? "Proceed with Stripe (mock)" : method === "momo" ? "I have paid with Momo" : method === "bank" ? "I have transferred" : "Confirm COD Order"}
        </Button>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.5s ease; }
      `}</style>
    </div>
  );
} 