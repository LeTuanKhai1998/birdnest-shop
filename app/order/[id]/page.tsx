"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  // Optionally, fetch order details here in the future

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white items-center justify-center py-12 px-2">
      <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-lg p-8 flex flex-col items-center animate-fade-in">
        {/* Checkmark animation */}
        <div className="mb-6">
          <svg className="w-16 h-16 text-green-500 animate-bounce-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#e6f9ed" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l3 3.5 5-5.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Thank you for your order!</h1>
        <p className="text-lg text-gray-700 text-center mb-4">Your order has been placed successfully.</p>
        <div className="bg-gray-50 rounded-lg px-4 py-2 mb-4 w-full text-center">
          <span className="text-gray-500 text-sm">Order ID:</span>
          <span className="ml-2 font-mono font-semibold text-base">{id}</span>
        </div>
        {/* Mock summary */}
        <div className="w-full mb-6">
          <div className="flex flex-col gap-1 text-sm text-gray-700">
            <div><span className="font-medium">Name:</span> (mock) Nguyễn Văn A</div>
            <div><span className="font-medium">Address:</span> (mock) 123 Đường ABC, Quận 1, TP.HCM</div>
            <div><span className="font-medium">Total Paid:</span> <span className="text-red-700 font-bold">2.500.000 ₫</span></div>
          </div>
        </div>
        <Button asChild className="w-full mt-2">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
      <style jsx global>{`
        @keyframes bounce-in {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-bounce-in { animation: bounce-in 0.7s cubic-bezier(0.68,-0.55,0.27,1.55); }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.7s ease; }
      `}</style>
    </div>
  );
} 