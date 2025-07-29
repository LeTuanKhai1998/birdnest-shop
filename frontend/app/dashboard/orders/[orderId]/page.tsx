'use client';
import { use, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Truck, XCircle } from 'lucide-react';
import Link from 'next/link';
import { mockOrders, Order } from '@/lib/mock-orders';
import Image from 'next/image';

const statusColor: Record<string, string> = {
  DELIVERED: 'bg-green-100 text-green-700',
  SHIPPED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

function formatVND(amount: number) {
  return amount.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      // Use mock data for mock orders or fetch from API
      if (orderId.startsWith('mock')) {
        const mockOrder = mockOrders.find((o) => o.id === orderId) || null;
        setOrder(mockOrder);
      } else {
        // Fetch real order from API
        try {
          const response = await fetch(`/api/orders/${orderId}`);
          if (response.ok) {
            const realOrder = await response.json();
            setOrder(realOrder);
          }
        } catch (error) {
          console.error('Error fetching order:', error);
        }
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Loading order...</div>
      </div>
    );
  }

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
        <Button variant="ghost" className="mb-4">
          ← Back to Orders
        </Button>
      </Link>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-xs text-gray-500">
              Order ID: {order.id}
            </div>
            <div className="text-sm text-gray-400">
              {formatDate(order.createdAt)}
            </div>
          </div>
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${statusColor[order.status] || 'bg-gray-100 text-gray-800'}`}
          >
            {order.status === 'DELIVERED' && (
              <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
            )}
            {order.status === 'SHIPPED' && (
              <Truck className="w-4 h-4 mr-1 text-blue-600" />
            )}
            {order.status === 'CANCELLED' && (
              <XCircle className="w-4 h-4 mr-1 text-red-600" />
            )}
            {order.status}
          </span>
        </div>
        <div className="divide-y">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-4">
              {item.product?.images?.[0] && (
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  width={80}
                  height={80}
                  className="object-cover rounded-lg"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{item.product?.name}</div>
                <div className="text-gray-500 text-sm">
                  x{item.quantity} &middot; {formatVND(Number(item.price))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="font-medium text-gray-600">Total</div>
          <div className="font-bold text-xl text-red-700">
            {formatVND(Number(order.total))}
          </div>
        </div>
      </Card>
    </div>
  );
}
