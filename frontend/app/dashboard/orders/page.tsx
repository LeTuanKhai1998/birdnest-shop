"use client";
import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle, Truck, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatVND, formatDate, statusColor } from "@/lib/order-utils";
import Image from 'next/image';
import { ordersApi, Order } from "@/lib/api-service";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await ordersApi.getOrders();
        const fetchedOrders = response.data?.orders || response.orders || [];
        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError("Không thể tải đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Navigation handler
  const handleViewOrder = useCallback((orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`);
  }, [router]);

  // Render a single order card
  const renderOrderCard = (order: Order) => (
    <Card
      key={order.id}
      className="group flex flex-col border rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white px-4 py-4 md:px-6 md:py-5 min-h-[180px]"
      aria-label={`Order ${order.id}`}
      role="region"
    >
      {/* Header: Order ID, status, date */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs text-gray-400">Đơn hàng #{order.id.slice(0, 8)}</span>
          <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
        </div>
        <span
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColor[order.status] || "bg-gray-100 text-gray-800 border-gray-200"}`}
          aria-label={`Order status: ${order.status}`}
        >
          {order.status === "DELIVERED" && <CheckCircle className="w-4 h-4 text-green-600" />}
          {order.status === "SHIPPED" && <Truck className="w-4 h-4 text-blue-600" />}
          {order.status === "CANCELLED" && <XCircle className="w-4 h-4 text-red-600" />}
          {order.status}
        </span>
      </div>
      {/* Product(s) */}
      <div className="flex items-center gap-4 mb-3">
        {order.orderItems?.[0]?.product?.images?.[0]?.url && (
          <Image 
            src={order.orderItems[0].product.images[0].url} 
            alt={order.orderItems[0].product.name} 
            width={80} 
            height={80} 
            className="object-cover rounded-lg" 
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-base truncate text-gray-900">
            {order.orderItems?.[0]?.product?.name || "Sản phẩm"}
          </div>
          <div className="text-xs text-gray-500">
            x{order.orderItems?.[0]?.quantity || 0}
          </div>
          {order.orderItems && order.orderItems.length > 1 && (
            <div className="text-xs text-gray-400 mt-1">
              +{order.orderItems.length - 1} sản phẩm khác
            </div>
          )}
        </div>
      </div>
      {/* Footer: Total and View button */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 gap-2">
        <div className="font-bold text-lg text-red-700">{formatVND(Number(order.total))}</div>
        <Button
          variant="outline"
          size="sm"
          className="group-hover:border-primary group-hover:text-primary transition flex items-center gap-1 px-3 py-2 rounded-md"
          aria-label="Xem chi tiết đơn hàng"
          onClick={() => handleViewOrder(order.id)}
        >
          <Eye className="w-4 h-4 mr-1" /> Xem
        </Button>
      </div>
    </Card>
  );

  // Loading state
  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Đang tải đơn hàng của bạn...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Thử lại</Button>
      </div>
    );
  }

  // No orders state
  if (orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-bold mb-6 text-center">Đơn hàng của bạn</h2>
        <div className="text-gray-500 text-lg mb-4">Bạn chưa đặt đơn hàng nào.</div>
        <Button asChild>
          <Link href="/products">Bắt đầu mua sắm</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Đơn hàng của bạn</h2>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-x-auto px-1">
        {orders.map(renderOrderCard)}
      </div>
    </div>
  );
} 