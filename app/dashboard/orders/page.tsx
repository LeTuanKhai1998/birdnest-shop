"use client";
import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle, Truck, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { mockOrders, Order } from "@/lib/mock-orders";
import { formatVND, formatDate, statusColor } from "@/lib/order-utils";

// API response type
interface OrdersApiResponse {
  orders?: Order[];
  error?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Fetch orders from API
  useEffect(() => {
    setLoading(true);
    fetch("/api/orders")
      .then(res => res.json())
      .then((data: OrdersApiResponse) => {
        if (data.orders) setOrders(data.orders);
        else setError(data.error || "Failed to load orders");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load orders");
        setLoading(false);
      });
  }, []);

  // Navigation handler
  const handleViewOrder = useCallback((orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`);
  }, [router]);

  // Render a single order card
  const renderOrderCard = (order: Order) => (
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
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${statusColor[order.status] || "bg-gray-100 text-gray-800"}`}
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
          onClick={() => handleViewOrder(order.id)}
        >
          <Eye className="w-4 h-4 mr-1" /> View
        </Button>
      </div>
    </Card>
  );

  // Loading state
  if (loading) return <div className="py-16 text-center text-lg">Loading your orders...</div>;
  // Error state
  if (error) return <div className="py-16 text-center text-red-500">{error}</div>;

  // No orders, show mock data
  const displayOrders = orders.length ? orders : mockOrders;
  const isMock = !orders.length;

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Your Orders{isMock ? " (Mock Data)" : ""}
      </h2>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-x-auto px-1">
        {displayOrders.map(renderOrderCard)}
      </div>
    </div>
  );
} 