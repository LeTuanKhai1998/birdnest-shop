"use client";
import { AdminTable } from "@/components/ui/AdminTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState as useLocalState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUS = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const orders = [
    { id: 'o1', customer: 'Nguyễn Văn A', total: 3500000, status: 'PAID', date: '2024-07-24' },
    { id: 'o2', customer: 'Trần Thị B', total: 1800000, status: 'PENDING', date: '2024-07-23' },
    { id: 'o3', customer: 'Lê Minh C', total: 7000000, status: 'DELIVERED', date: '2024-07-22' },
  ];
  const [orderList, setOrderList] = useState(orders);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<{ id: string; status: string } | null>(null);
  const [showMoreMap, setShowMoreMap] = useState<Record<string, boolean>>({});

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue]);

  // Filter orders in-memory
  const filteredOrders = useMemo(() => {
    return orderList.filter((o) => {
      const matchesSearch =
        !debouncedSearch ||
        o.id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        o.customer.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus = !statusFilter || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orderList, debouncedSearch, statusFilter]);

  // Status change handler
  const onStatusChange = (orderId: string, newStatus: string) => {
    setOrderList(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  function formatFullDate(date: string) {
    const d = new Date(date);
    return d.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 min-w-0">
      <h2 className="text-2xl font-bold mb-4">Order Management</h2>
      {/* Filter Bar */}
      <form className="mb-2 flex flex-wrap gap-4 items-end w-full" onSubmit={e => e.preventDefault()} aria-label="Order Filters">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="order-search" className="block text-xs font-medium mb-1">Search (Order ID, Customer)</label>
          <Input
            id="order-search"
            placeholder="Search orders..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="order-status" className="block text-xs font-medium mb-1">Status</label>
          <select
            id="order-status"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            {STATUS.map((s) => (
              <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>
        <div>
          <Button type="button" variant="outline" onClick={() => { setStatusFilter(""); setSearchValue(""); }}>Reset</Button>
        </div>
      </form>
      {/* Desktop Table */}
      <div className="hidden md:block w-full min-w-0 overflow-x-auto">
        <AdminTable
          columns={[
            { key: "id", label: "Order ID" },
            { key: "customer", label: "Customer Name" },
            { key: "total", label: "Total" },
            { key: "status", label: "Status" },
            { key: "date", label: "Date" },
          ]}
          data={filteredOrders.map(o => ({
            ...o,
            total: o.total.toLocaleString() + " ₫",
            status: (
              <DropdownMenu>
                <DropdownMenuTrigger asChild aria-label="Change order status">
                  <button className="flex items-center gap-1 min-w-[90px] px-2 py-1 outline-none">
                    <Badge className={
                      o.status === "PAID" || o.status === "DELIVERED"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : o.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                        : o.status === "CANCELLED"
                        ? "bg-red-100 text-red-800 border-red-200"
                        : o.status === "SHIPPED"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }>
                      {o.status}
                    </Badge>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {STATUS.map(s => (
                    <DropdownMenuItem key={s} onClick={() => onStatusChange(o.id, s)}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          }))}
          actions={o => (
            <div className="flex gap-2 justify-end">
              <Button type="button" size="sm" variant="outline" className="rounded-full px-4 py-1 text-sm font-semibold" onClick={() => setViewId(o.id)}>
                View
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="rounded-full px-4 py-1 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 ml-2"
                onClick={() => setDeleteId(o.id)}
                aria-label="Delete order"
              >
                Delete
              </Button>
            </div>
          )}
          exportButtons={[
            <Button key="csv" className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded" onClick={() => alert('Export CSV')}>Export CSV</Button>,
            <Button key="pdf" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded" onClick={() => alert('Export PDF')}>Export PDF</Button>,
          ]}
        />
      </div>
      {/* Mobile Card List */}
      <div className="block md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 pb-24 max-w-2xl mx-auto">
        {filteredOrders.map((o) => {
          let badgeColor = "bg-gray-100 text-gray-800 border-gray-200";
          if (o.status === "PAID" || o.status === "DELIVERED") badgeColor = "bg-green-100 text-green-800 border-green-200";
          else if (o.status === "PENDING") badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
          else if (o.status === "CANCELLED") badgeColor = "bg-red-100 text-red-800 border-red-200";
          else if (o.status === "SHIPPED") badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
          return (
            <div key={o.id} className="rounded-xl border p-4 bg-white shadow-sm flex flex-col gap-2 relative">
              {/* Top Row: Order ID and Status */}
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-base text-blue-900">#{o.id}</span>
                <Badge className={badgeColor + " px-3 py-1 text-xs font-semibold rounded-full"}>{o.status}</Badge>
              </div>
              {/* Name and Price Row */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{o.customer}</span>
                <span className="font-bold text-red-600 text-lg">₫{o.total.toLocaleString()}</span>
              </div>
              {/* Date Row */}
              <div className="text-sm text-gray-500 mb-2">
                {formatFullDate(o.date)}
              </div>
              {/* Actions */}
              <div className="flex gap-2 mt-2">
                <Button type="button" size="sm" variant="outline" className="flex-1" onClick={() => setViewId(o.id)} aria-label={`View order ${o.id}`}>
                  View
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center justify-center gap-1"
                  onClick={() => setDeleteId(o.id)}
                  aria-label={`Delete order ${o.id}`}
                >
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
        {/* Floating Add Order Button (disabled for now) */}
        {/*
        <Button className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 p-0 shadow-lg bg-primary text-white text-2xl flex items-center justify-center" aria-label="Add Order" disabled>
          +
        </Button>
        */}
      </div>
      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2 text-red-700">Delete Order</h3>
            <p className="mb-4 text-gray-700">Are you sure you want to delete this order? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { setDeleteId(null); /* TODO: Delete logic */ }} className="bg-red-600 text-white hover:bg-red-700">Delete</Button>
            </div>
          </div>
        </div>
      )}
      <Dialog open={!!viewId} onOpenChange={open => { if (!open) setViewId(null); }}>
        <DialogContent className="w-full sm:max-w-2xl sm:rounded-xl max-h-[90vh] overflow-y-auto p-6">
          {(() => {
            const order = orderList.find(o => o.id === viewId);
            if (!order) return null;
            let badgeColor = "bg-gray-100 text-gray-800 border-gray-200";
            if (order.status === "PAID" || order.status === "DELIVERED") badgeColor = "bg-green-100 text-green-800 border-green-200";
            else if (order.status === "PENDING") badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
            else if (order.status === "CANCELLED") badgeColor = "bg-red-100 text-red-800 border-red-200";
            else if (order.status === "SHIPPED") badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
            const items = [
              {
                id: 'p1',
                name: 'Tổ yến tinh chế 50g',
                image: '/images/p1.png',
                quantity: 2,
                price: 1750000,
              },
              {
                id: 'p2',
                name: 'Tổ yến thô 100g',
                image: '/images/p2.png',
                quantity: 1,
                price: 3200000,
              },
            ];
            const subtotal = items.reduce((sum: number, item) => sum + item.price * item.quantity, 0);
            const discount = 0;
            const shipping = 0;
            const finalTotal = subtotal - discount + shipping;
            const payment = 'Credit Card';
            const shippingAddress = '123 Main St, District 1, HCMC';
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between gap-2">
                    <DialogTitle>Order #{order.id}</DialogTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild aria-label="Change order status">
                        <button className="flex items-center gap-1 outline-none">
                          <Badge className={badgeColor}>{order.status}</Badge>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {STATUS.map(s => (
                          <DropdownMenuItem key={s} onClick={() => onStatusChange(order.id, s)}>
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  <div><span className="font-semibold">Customer:</span> {order.customer}</div>
                  <div><span className="font-semibold">Date:</span> {order.date}</div>
                  <div><span className="font-semibold">Total:</span> <span className="font-bold text-red-700">₫{order.total.toLocaleString()}</span></div>
                  <div><span className="font-semibold">Payment:</span> {payment}</div>
                  <div className="sm:col-span-2"><span className="font-semibold">Shipping:</span> {shippingAddress}</div>
                </div>
                <div className="mb-4">
                  <div className="font-semibold mb-2">Products</div>
                  <div className="flex flex-col gap-4 divide-y">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-4 pt-2 first:pt-0">
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded border" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.quantity} × ₫{item.price.toLocaleString()} = <span className="font-semibold text-gray-900">₫{(item.price * item.quantity).toLocaleString()}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 border-t pt-4 space-y-1 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>₫{subtotal.toLocaleString()}</span></div>
                  {discount > 0 && <div className="flex justify-between"><span>Discount</span><span>-₫{discount.toLocaleString()}</span></div>}
                  {shipping > 0 && <div className="flex justify-between"><span>Shipping</span><span>₫{shipping.toLocaleString()}</span></div>}
                  <div className="flex justify-between font-bold text-base text-red-700"><span>Total</span><span>₫{finalTotal.toLocaleString()}</span></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setViewId(null)}>Close</Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
} 