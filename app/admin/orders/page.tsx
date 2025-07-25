"use client";
import { AdminTable } from "@/components/ui/AdminTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState as useLocalState } from "react";

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
            status: <StatusBadge status={o.status} />,
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
          const showMore = !!showMoreMap[o.id];
          const details = `Order ID: ${o.id}\nCustomer: ${o.customer}\nDate: ${o.date}\nStatus: ${o.status}\nTotal: ₫${o.total.toLocaleString()}`;
          const isLong = details.length > 80;
          return (
            <Card key={o.id} className="flex flex-col gap-2 p-4 border border-gray-200 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]">
              <div className="flex items-center justify-between mb-2">
                <div className="font-mono text-xs text-gray-400">#{o.id}</div>
                <StatusBadge status={o.status} />
              </div>
              <div className="flex flex-col gap-1 mb-1">
                <div className="font-bold text-base text-gray-900">{o.customer}</div>
                <div className="font-bold text-lg text-red-700">₫{o.total.toLocaleString()}</div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Date: {o.date}</span>
              </div>
              <div className="text-xs text-gray-700 whitespace-pre-line mb-2">
                <span>
                  {isLong && !showMore ? details.slice(0, 80) + "..." : details}
                </span>
                {isLong && (
                  <button className="ml-2 text-primary underline text-xs" onClick={e => { e.preventDefault(); setShowMoreMap(prev => ({ ...prev, [o.id]: !prev[o.id] })); }}>
                    {showMore ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
              <hr className="my-2 border-gray-200" />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button type="button" size="sm" variant="outline" className="w-full" onClick={() => setViewId(o.id)} aria-label={`View order ${o.id}`}>
                  View
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setDeleteId(o.id)}
                  aria-label={`Delete order ${o.id}`}
                >
                  Delete
                </Button>
              </div>
            </Card>
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
      {/* View/Edit modal placeholder */}
      {viewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Order Details</h3>
            <p className="mb-4 text-gray-700">Order ID: {viewId}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setViewId(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 