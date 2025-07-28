"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Truck, XCircle } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { ordersApi, Order } from "@/lib/api-service";

const statusColor: Record<string, string> = {
  DELIVERED: "bg-green-100 text-green-700",
  SHIPPED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function formatVND(amount: number) {
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN", { year: "numeric", month: "short", day: "numeric" });
}

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const [orderId, setOrderId] = useState<string>("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ orderId: resolvedOrderId }) => {
      setOrderId(resolvedOrderId);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 font-semibold">{error || "Không tìm thấy đơn hàng."}</div>
        <Link href="/dashboard/orders">
          <Button className="mt-4">Quay lại đơn hàng</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-2">
      <Link href="/dashboard/orders">
        <Button variant="ghost" className="mb-4">← Quay lại đơn hàng</Button>
      </Link>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-xs text-gray-500">Mã đơn hàng: {order.id}</div>
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
          {order.orderItems?.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-4">
              {item.product?.images?.[0]?.url && (
                <Image 
                  src={item.product.images[0].url} 
                  alt={item.product.name} 
                  width={80} 
                  height={80} 
                  className="object-cover rounded-lg" 
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{item.product?.name || "Sản phẩm"}</div>
                <div className="text-gray-500 text-sm">
                  x{item.quantity || 0} &middot; {formatVND(Number(item.price || 0))}
                </div>
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