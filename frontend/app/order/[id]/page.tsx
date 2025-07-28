"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { ordersApi, Order } from "@/lib/api-service";

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const [orderId, setOrderId] = useState<string>("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      setOrderId(id);
    });
  }, [params]);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ordersApi.getOrder(orderId);
        const fetchedOrder = response.data?.order || response.order;
        setOrder(fetchedOrder);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white items-center justify-center py-12 px-2">
        <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col min-h-screen bg-white items-center justify-center py-12 px-2">
        <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <div className="text-red-500 font-semibold mb-4">{error || "Order not found."}</div>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

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
          <span className="ml-2 font-mono font-semibold text-base">{orderId}</span>
        </div>
        {/* Order summary */}
        <div className="w-full mb-6">
          <div className="flex flex-col gap-1 text-sm text-gray-700">
            <div><span className="font-medium">Status:</span> {order.status}</div>
            <div><span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString("vi-VN")}</div>
            <div><span className="font-medium">Items:</span> {order.orderItems?.length || 0} item(s)</div>
            <div><span className="font-medium">Total Paid:</span> <span className="text-red-700 font-bold">{Number(order.total).toLocaleString("vi-VN")} ₫</span></div>
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