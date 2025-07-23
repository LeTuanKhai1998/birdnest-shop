"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle, Truck, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const router = useRouter();

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
  if (!orders.length && !error) {
    // Mock data for UI review
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Your Orders (Mock Data)</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer border p-5 flex flex-col gap-3 group"
            >
              {/* Top row: Order ID, date, status */}
              <div className="flex items-center justify-between mb-2">
                <div className="font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</div>
                <div className="text-sm text-gray-400">{formatDate(order.createdAt)}</div>
                <div className="flex items-center gap-1">
                  {order.status === "DELIVERED" && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {order.status === "SHIPPED" && <Truck className="w-4 h-4 text-blue-600" />}
                  {order.status === "CANCELLED" && <XCircle className="w-4 h-4 text-red-600" />}
                  <span className={`ml-1 px-2 py-0.5 rounded text-xs font-semibold ${statusColor[order.status] || "bg-gray-100 text-gray-800"}`}>{order.status}</span>
                </div>
              </div>
              {/* Middle: Product(s) */}
              <div className="flex items-center gap-3">
                {order.orderItems[0]?.product?.images?.[0] && (
                  <img src={order.orderItems[0].product.images[0]} alt={order.orderItems[0].product.name} className="w-14 h-14 object-cover rounded border" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{order.orderItems[0]?.product?.name}</div>
                  <div className="text-xs text-gray-500">x{order.orderItems[0]?.quantity}</div>
                  {order.orderItems.length > 1 && (
                    <div className="text-xs text-gray-400 mt-1">+{order.orderItems.length - 1} more item(s)</div>
                  )}
                </div>
              </div>
              {/* Bottom: Total and View button */}
              <div className="flex items-center justify-between mt-2">
                <div className="font-bold text-lg text-red-700">{formatVND(Number(order.total))}</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="group-hover:border-primary group-hover:text-primary transition flex items-center cursor-pointer"
                  onClick={() => router.push(`/order/${order.id}`)}
                >
                  <Eye className="w-4 h-4 mr-1" /> View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Real orders
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Orders{!orders.length && !error ? " (Mock Data)" : ""}</h2>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-x-auto px-1">
        {(orders.length ? orders : mockOrders).map((order: Order) => (
          <Card
            key={order.id}
            className="hover:shadow-lg transition cursor-pointer border flex flex-col gap-3 group"
            aria-label={`Order ${order.id}`}
            role="region"
          >
            {/* Top row: Order ID, date, status */}
            <div className="flex items-center justify-between mb-2">
              <div className="font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</div>
              <div className="text-sm text-gray-400">{formatDate(order.createdAt)}</div>
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold
                  ${order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                    order.status === "SHIPPED" ? "bg-blue-100 text-blue-700" :
                    order.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-800"}
                `}
                aria-label={`Order status: ${order.status}`}
              >
                {order.status === "DELIVERED" && <CheckCircle className="w-4 h-4 mr-1 text-green-600" />}
                {order.status === "SHIPPED" && <Truck className="w-4 h-4 mr-1 text-blue-600" />}
                {order.status === "CANCELLED" && <XCircle className="w-4 h-4 mr-1 text-red-600" />}
                {order.status}
              </span>
            </div>
            {/* Middle: Product(s) */}
            <div className="flex items-center gap-3">
              {order.orderItems[0]?.product?.images?.[0] && (
                <img src={order.orderItems[0].product.images[0]} alt={order.orderItems[0].product.name} className="w-14 h-14 object-cover rounded border" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{order.orderItems[0]?.product?.name}</div>
                <div className="text-xs text-gray-500">x{order.orderItems[0]?.quantity}</div>
                {order.orderItems.length > 1 && (
                  <div className="text-xs text-gray-400 mt-1">+{order.orderItems.length - 1} more item(s)</div>
                )}
              </div>
            </div>
            {/* Bottom: Total and View button */}
            <div className="flex items-center justify-between mt-2">
              <div className="font-bold text-lg text-red-700">{formatVND(Number(order.total))}</div>
              <Button
                variant="outline"
                size="sm"
                className="group-hover:border-primary group-hover:text-primary transition flex items-center cursor-pointer"
                aria-label="View order details"
                onClick={() => router.push(`/dashboard/orders/${order.id}`)}
              >
                <Eye className="w-4 h-4 mr-1" /> View
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 