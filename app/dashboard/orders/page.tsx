"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

function formatVND(amount: number) {
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN", { year: "numeric", month: "short", day: "numeric" });
}

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => {
        if (data.orders) setOrders(data.orders);
        else setError(data.error || "Failed to load orders");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load orders");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="py-16 text-center text-lg">Loading your orders...</div>;
  if (error) return <div className="py-16 text-center text-red-500">{error}</div>;
  if (!orders.length) return <div className="py-16 text-center text-gray-500">You have no orders yet.</div>;

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Orders</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="text-left border-b">
              <th className="p-4">Order ID</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Total</th>
              <th className="p-4">Items</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <>
                <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                  <td className="p-4">{formatDate(order.createdAt)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor[order.status] || "bg-gray-100 text-gray-800"}`}>{order.status}</span>
                  </td>
                  <td className="p-4 font-semibold">{formatVND(Number(order.total))}</td>
                  <td className="p-4">{order.orderItems.length}</td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:underline text-sm" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                      {expanded === order.id ? "Hide" : "View"}
                    </button>
                  </td>
                </tr>
                {expanded === order.id && (
                  <tr>
                    <td colSpan={6} className="bg-gray-50 p-4">
                      <div className="grid gap-2">
                        {order.orderItems.map((item: any) => (
                          <Card key={item.id} className="flex items-center gap-4 p-4">
                            {item.product?.images?.[0] && (
                              <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                            )}
                            <div className="flex-1">
                              <div className="font-semibold">{item.product?.name}</div>
                              <div className="text-gray-500 text-sm">x{item.quantity} &middot; {formatVND(Number(item.price))}</div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 