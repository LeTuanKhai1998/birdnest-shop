"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Truck, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product: { id: string; name: string; images: string[] };
};
type Order = {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  orderItems: OrderItem[];
};

const statusColor: Record<string, string> = {
  DELIVERED: "bg-green-100 text-green-700",
  SHIPPED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const mockOrders: Order[] = [
  {
    id: "mock1",
    createdAt: new Date().toISOString(),
    status: "DELIVERED",
    total: 4200000,
    orderItems: [
      {
        id: "item1",
        quantity: 2,
        price: 2100000,
        product: {
          id: "p5",
          name: "Raw Birdnest 50g",
          images: ["/images/p2.png"],
        },
      },
    ],
  },
  {
    id: "mock2",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: "SHIPPED",
    total: 7900000,
    orderItems: [
      {
        id: "item2",
        quantity: 1,
        price: 7900000,
        product: {
          id: "p3",
          name: "Feather-removed Birdnest 200g",
          images: ["/images/p3.png"],
        },
      },
    ],
  },
];

function formatVND(amount: number) {
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN", { year: "numeric", month: "short", day: "numeric" });
}

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  // Use mock data for mock orders
  let order: Order | null = null;
  if (orderId.startsWith("mock")) {
    order = mockOrders.find((o) => o.id === orderId) || null;
  }
  // TODO: Fetch real order from API if not mock

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 font-semibold">Order not found.</div>
        <Link href="/dashboard/orders">
          <Button className="mt-4">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-2">
      <Link href="/dashboard/orders">
        <Button variant="ghost" className="mb-4">← Back to Orders</Button>
      </Link>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-xs text-gray-500">Order ID: {order.id}</div>
            <div className="text-sm text-gray-400">{formatDate(order.createdAt)}</div>
          </div>
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${statusColor[order.status] || "bg-gray-100 text-gray-800"}`}>
            {order.status === "DELIVERED" && <CheckCircle className="w-4 h-4 mr-1 text-green-600" />}
            {order.status === "SHIPPED" && <Truck className="w-4 h-4 mr-1 text-blue-600" />}
            {order.status === "CANCELLED" && <XCircle className="w-4 h-4 mr-1 text-red-600" />}
            {order.status}
          </span>
        </div>
        <div className="divide-y">
          {order.orderItems.map((item: OrderItem) => (
            <div key={item.id} className="flex items-center gap-4 py-4">
              {item.product?.images?.[0] && (
                <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded border" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{item.product?.name}</div>
                <div className="text-gray-500 text-sm">x{item.quantity} &middot; {formatVND(Number(item.price))}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="font-medium text-gray-600">Total</div>
          <div className="font-bold text-xl text-red-700">{formatVND(Number(order.total))}</div>
        </div>
      </Card>
    </div>
  );
} 