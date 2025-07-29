'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  BarChart2,
  Loader,
} from 'lucide-react';
import { useMemo } from 'react';
import { formatVND, formatDate, statusColor } from '@/lib/order-utils';
import { MoreHorizontal } from 'lucide-react';
import useSWR from 'swr/immutable';
import { fetcher } from '@/lib/utils';
import type { Order } from '@/lib/mock-orders';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  Tooltip as RechartsTooltip,
  Cell,
  PieChart,
  Pie,
  Cell as RechartsCell,
  Legend as RechartsLegend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import Papa from 'papaparse';
import 'jspdf-autotable';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import type { Product } from '@/components/ProductCard';
import Image from 'next/image';

const FILTERS = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

function groupOrders(orders: any[], filter: string) {
  const map = new Map<string, number>();
  orders.forEach((order: any) => {
    const date = new Date(order.createdAt);
    let key: string;
    if (filter === 'daily') {
      key = date.toISOString().slice(0, 10);
    } else if (filter === 'weekly') {
      const week = `${date.getFullYear()}-W${Math.ceil((date.getDate() - date.getDay() + 1) / 7)}`;
      key = week;
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    map.set(key, (map.get(key) || 0) + parseFloat(order.total));
  });
  return Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue }));
}

// Replace showToast with sonner toast
function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast[type](message);
}

// --- Export helpers for tables ---
function exportOrdersCSV(data: (Order & { customer: string })[]) {
  const rows = data.map((o) => ({
    ID: o.id,
    Customer: o.customer,
    Total: o.total,
    Status: o.status,
    Date: format(parseISO(o.createdAt), 'yyyy-MM-dd HH:mm'),
  }));
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
async function exportOrdersPDF(data: (Order & { customer: string })[]) {
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF();
  doc.text('Recent Orders', 14, 16);
  autoTable(doc, {
    head: [['ID', 'Customer', 'Total', 'Status', 'Date']],
    body: data.map((o) => [
      o.id,
      o.customer,
      formatVND(o.total),
      o.status,
      format(parseISO(o.createdAt), 'yyyy-MM-dd HH:mm'),
    ]),
    startY: 22,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [220, 38, 38] },
  });
  doc.save(`orders-${Date.now()}.pdf`);
}
function exportLowStockCSV(data: Product[]) {
  const rows = data.map((p) => ({
    Product: p.name,
    Stock: p.quantity,
    Status: (p.quantity ?? 0) < 3 ? 'Critical' : 'Low',
  }));
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `low-stock-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
async function exportLowStockPDF(data: Product[]) {
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF();
  doc.text('Low Stock Alerts', 14, 16);
  autoTable(doc, {
    head: [['Product', 'Stock', 'Status']],
    body: data.map((p) => [
      p.name,
      p.quantity ?? 0,
      (p.quantity ?? 0) < 3 ? 'Critical' : 'Low',
    ]),
    startY: 22,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [234, 179, 8] },
  });
  doc.save(`low-stock-${Date.now()}.pdf`);
}
function exportTopProductsCSV(
  data: {
    name: string;
    unitsSold: number;
    revenue: number;
    stock: number;
    image: string;
  }[],
) {
  const rows = data.map((p) => ({
    Product: p.name,
    'Units Sold': p.unitsSold,
    Revenue: p.revenue,
    Stock: p.stock < 3 ? 'Critical' : p.stock < 10 ? 'Low' : 'In Stock',
  }));
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `top-products-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
async function exportTopProductsPDF(
  data: {
    name: string;
    unitsSold: number;
    revenue: number;
    stock: number;
    image: string;
  }[],
) {
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF();
  doc.text('Top Products', 14, 16);
  autoTable(doc, {
    head: [['Product', 'Units Sold', 'Revenue', 'Stock']],
    body: data.map((p) => [
      p.name,
      p.unitsSold,
      formatVND(p.revenue),
      p.stock < 3 ? 'Critical' : p.stock < 10 ? 'Low' : 'In Stock',
    ]),
    startY: 22,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [34, 197, 94] },
  });
  doc.save(`top-products-${Date.now()}.pdf`);
}

export default function AdminDashboardPage() {
  // All hooks at the top, before any return
  const { data: ordersData, error: ordersError } = useSWR('/api/orders', fetcher, { refreshInterval: 5000 });
  const { data: productsData, error: productsError } = useSWR('/api/products', fetcher, { refreshInterval: 10000 });
  const { data: usersData, error: usersError } = useSWR('/api/users', fetcher);
  const orders = ordersData?.orders || [];
  const products = productsData || [];
  const users = usersData?.users || [];

  // Error/unauthorized handling
  const { data: session, status } = useSession();
  const router = useRouter();
  if (!session || !session.user || !session.user.isAdmin || (ordersError && ordersError.message?.includes('401'))) {
    if (typeof window !== 'undefined') {
      router.replace('/login?callbackUrl=/admin');
    }
    return <div className="flex items-center justify-center h-screen text-xl">You are not authorized. Please <a href="/login" className="text-blue-600 underline ml-2">login</a>.</div>;
  }
  if (ordersError && !ordersError.message?.includes('401')) {
    return <div className="flex items-center justify-center h-screen text-xl text-red-600">Failed to load orders: {ordersError.message}</div>;
  }
  if (productsError) {
    return <div className="flex items-center justify-center h-screen text-xl text-red-600">Failed to load products: {productsError.message}</div>;
  }
  if (usersError) {
    return <div className="flex items-center justify-center h-screen text-xl text-red-600">Failed to load users: {usersError.message}</div>;
  }
  const [filter, setFilter] = useState('monthly');
  const chartData = useMemo(() => groupOrders(orders, filter), [filter]);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const prevOrderIds = useRef<Set<string>>(new Set<string>());
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(
    null,
  );
  // Metrics
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + parseFloat(o.total), 0);
  const totalOrders = orders.length;
  const uniqueCustomerIds = new Set(orders.map((o: any) => o.userId));
  const totalCustomers = uniqueCustomerIds.size;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const metrics = [
    {
      label: 'Total Revenue',
      value: totalRevenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
      icon: DollarSign,
      trend: 0, // Placeholder, can be calculated if needed
      positive: true,
    },
    {
      label: 'Total Orders',
      value: totalOrders.toLocaleString(),
      icon: ShoppingBag,
      trend: 0,
      positive: true,
    },
    {
      label: 'Total Customers',
      value: totalCustomers.toLocaleString(),
      icon: Users,
      trend: 0,
      positive: true,
    },
    {
      label: 'Avg. Order Value',
      value: averageOrderValue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
      icon: BarChart2,
      trend: 0,
      positive: true,
    },
  ];
  // Revenue chart data
  function groupOrders(orders: any[], filter: string) {
    const map = new Map<string, number>();
    orders.forEach((order: any) => {
      const date = new Date(order.createdAt);
      let key: string;
      if (filter === 'daily') {
        key = date.toISOString().slice(0, 10);
      } else if (filter === 'weekly') {
        const week = `${date.getFullYear()}-W${Math.ceil((date.getDate() - date.getDay() + 1) / 7)}`;
        key = week;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      map.set(key, (map.get(key) || 0) + parseFloat(order.total));
    });
    return Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue }));
  }
  const [orderSort, setOrderSort] = useState({ key: 'createdAt', dir: 'desc' });
  const [statusFilter, setStatusFilter] = useState('');
  const ordersWithCustomer = orders.map((o: any) => ({
    ...o,
    customer: users.find((u: any) => u.id === o.userId)?.name || 'Unknown',
  }));
  let filteredOrders = statusFilter
    ? ordersWithCustomer.filter(
        (o: Order & { customer: string }) => o.status === statusFilter,
      )
    : ordersWithCustomer;
  filteredOrders = [...filteredOrders].sort(
    (a: Order & { customer: string }, b: Order & { customer: string }) => {
      if (orderSort.key === 'createdAt') {
        return orderSort.dir === 'desc'
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (orderSort.key === 'total') {
        return orderSort.dir === 'desc' ? b.total - a.total : a.total - b.total;
      }
      return 0;
    },
  );
  useEffect(() => {
    if (!orders.length) return;
    const currentIds = new Set<string>(orders.map((o: Order) => o.id));
    if (prevOrderIds.current.size) {
      for (const id of currentIds) {
        if (!prevOrderIds.current.has(id)) {
          setHighlightedOrderId(id);
          showToast('New order received!', 'success');
          setTimeout(() => setHighlightedOrderId(null), 3000);
          break;
        }
      }
    }
    prevOrderIds.current = currentIds;
  }, [orders]);
  const LOW_STOCK_THRESHOLD = 10;
  const lowStockProducts = (products as Product[]).filter(
    (p) => typeof p.quantity === 'number' && p.quantity < LOW_STOCK_THRESHOLD,
  );
  const allOrders = orders.length > 0 ? orders : [];
  // Remove duplicate/redeclared variables (productSalesMap, topProducts, etc.)
  // Only keep one block for topProducts and productSalesMap, using only real API data
  const productSalesMap = new Map<string, {
    name: string;
    image: string;
    unitsSold: number;
    revenue: number;
    stock: number;
  }>();
  allOrders.forEach((order: any) => {
    (order.items || []).forEach((item: any) => {
      if (!item.productId) return;
      if (!productSalesMap.has(item.productId)) {
        const prod = products.find((p: any) => p.id === item.productId);
        productSalesMap.set(item.productId, {
          name: prod?.name || 'Unknown',
          image: prod?.images?.[0]?.url || '',
          unitsSold: 0,
          revenue: 0,
          stock: prod?.quantity ?? 0,
        });
      }
      const entry = productSalesMap.get(item.productId);
      if (entry) {
        entry.unitsSold += item.quantity;
        entry.revenue += parseFloat(item.price) * item.quantity;
      }
    });
  });
  const topProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5);
  // Top customers
  const customerRevenueMap = new Map<string, { name: string; email: string; revenue: number }>();
  orders.forEach((order: any) => {
    if (!order.userId) return;
    if (!customerRevenueMap.has(order.userId)) {
      const user = users.find((u: any) => u.id === order.userId);
      customerRevenueMap.set(order.userId, {
        name: user?.name || 'Unknown',
        email: user?.email || '',
        revenue: 0,
      });
    }
    customerRevenueMap.get(order.userId)!.revenue += parseFloat(order.total);
  });
  const topCustomers = Array.from(customerRevenueMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  // Top products
  const acquisitionSources = [
    { name: 'Organic', value: 40 },
    { name: 'Facebook', value: 30 },
    { name: 'Google', value: 20 },
    { name: 'Referral', value: 10 },
  ];
  // Reports & Export state
  const [exportStart, setExportStart] = useState<string>('');
  const [exportEnd, setExportEnd] = useState<string>('');
  const filteredExportOrders = filteredOrders.filter(
    (order: Order & { customer: string }) => {
      if (!exportStart && !exportEnd) return true;
      const date = parseISO(order.createdAt);
      if (exportStart && isBefore(date, parseISO(exportStart))) return false;
      if (exportEnd && isAfter(date, parseISO(exportEnd))) return false;
      return true;
    },
  );
  function handleExportCSV() {
    const data = filteredExportOrders.map(
      (o: Order & { customer: string }) => ({
        ID: o.id,
        Customer: o.customer,
        Total: o.total,
        Status: o.status,
        Date: format(parseISO(o.createdAt), 'yyyy-MM-dd HH:mm'),
      }),
    );
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function handleExportPDF() {
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    doc.text('Orders Report', 14, 16);
    autoTable(doc, {
      head: [['ID', 'Customer', 'Total', 'Status', 'Date']],
      body: filteredExportOrders.map((o: Order & { customer: string }) => [
        o.id,
        o.customer,
        formatVND(o.total),
        o.status,
        format(parseISO(o.createdAt), 'yyyy-MM-dd HH:mm'),
      ]),
      startY: 22,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 38, 38] },
    });
    doc.save(`orders-${Date.now()}.pdf`);
  }
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/admin');
    } else if (
      status === 'authenticated' &&
      !(session?.user && session.user.isAdmin)
    ) {
      router.replace('/unauthorized');
    }
  }, [status, session, router]);
  // Loading states for SWR
  const ordersLoading = !ordersData && !ordersError;
  if (status === 'loading') {
    // Global loading state
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <Skeleton className="w-32 h-32 rounded-full" />
      </div>
    );
  }
  if (!session || !(session.user && session.user.isAdmin)) return null;

  // Add a deterministic color palette for products
  const PRODUCT_COLORS = [
    '#2563eb', // blue-600
    '#16a34a', // green-600
    '#dc2626', // red-600
    '#9333ea', // purple-600
    '#f59e42', // orange-400
    '#0d9488', // teal-600
    '#eab308', // yellow-500
    '#f43f5e', // pink-500
    '#64748b', // slate-500
    '#a21caf', // fuchsia-700
  ];

  function hashStringToColorIdx(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % PRODUCT_COLORS.length;
  }

  // Define a color palette for acquisition sources
  const ACQUISITION_COLORS = [
    '#fbbf24', // yellow-400 (Facebook)
    '#ef4444', // red-500 (Google)
    '#10b981', // green-500 (Organic)
    '#f59e42', // orange-400 (Referral)
    '#6366f1', // indigo-500 (extra)
    '#a21caf', // fuchsia-700 (extra)
  ];

  return (
    <div className="space-y-12 pb-12">
      {' '}
      {/* More vertical spacing between sections */}
      {/* Metrics Grid */}
      <section aria-label="Key Metrics" className="px-2 sm:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {metrics.map((m) => (
            <Card
              key={m.label}
              className="p-5 flex flex-col gap-2 shadow-sm rounded-xl border border-gray-100 dark:border-neutral-800"
            >
              <div className="flex items-center gap-3">
                <m.icon className="w-7 h-7 text-red-600" aria-hidden="true" />
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                  {m.label}
                </span>
              </div>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {m.value}
                </span>
                <span
                  className={
                    m.positive
                      ? 'text-green-600 flex items-center gap-1'
                      : 'text-red-600 flex items-center gap-1'
                  }
                >
                  {m.positive ? (
                    <TrendingUp className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <TrendingDown className="w-4 h-4" aria-hidden="true" />
                  )}
                  {m.trend}%
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>
      {/* Revenue Chart */}
      <section aria-label="Revenue Analytics" className="px-2 sm:px-4">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow p-4 sm:p-6 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h2 className="text-lg font-bold">Revenue</h2>
            <div className="flex gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  className={`px-3 py-1 rounded font-medium text-sm border transition focus-visible:ring-2 focus-visible:ring-red-500 focus:outline-none ${filter === f.value ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-neutral-700 hover:bg-red-50 dark:hover:bg-neutral-600'}`}
                  onClick={() => setFilter(f.value)}
                  aria-pressed={filter === f.value}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 16, right: 24, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={(v) => `$${v}`}
                  labelClassName="font-semibold"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#dc2626"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                  fillOpacity={0.2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
      {/* Recent Orders Table */}
      <section aria-label="Recent Orders" className="px-2 sm:px-4">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow p-4 sm:p-6 mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <div className="flex gap-2 items-center">
              <label htmlFor="order-status-filter" className="sr-only">
                Filter by status
              </label>
              <select
                id="order-status-filter"
                className="border rounded px-2 py-1 text-sm bg-gray-50 dark:bg-neutral-700 text-gray-700 dark:text-gray-200 focus-visible:ring-2 focus-visible:ring-red-500 focus:outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => exportOrdersCSV(filteredOrders)}
              className="px-3 py-1 rounded bg-green-600 text-white text-xs font-medium hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-500 focus:outline-none"
            >
              Export CSV
            </button>
            <button
              onClick={() => exportOrdersPDF(filteredOrders)}
              className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none"
            >
              Export PDF
            </button>
          </div>
          <div
            className="overflow-x-auto"
            role="table"
            aria-label="Orders Table"
          >
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <Loader
                  className="w-8 h-8 animate-spin text-red-600"
                  aria-label="Loading orders"
                />
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-600 dark:text-gray-300">
                    <th
                      scope="col"
                      className="py-2 px-3 text-left align-middle cursor-pointer"
                      onClick={() =>
                        setOrderSort((s) => ({
                          key: 'id',
                          dir: s.dir === 'asc' ? 'desc' : 'asc',
                        }))
                      }
                      tabIndex={0}
                    >
                      Order ID
                    </th>
                    <th scope="col" className="py-2 px-3">
                      Customer Name
                    </th>
                    <th
                      scope="col"
                      className="py-2 px-3 cursor-pointer"
                      onClick={() =>
                        setOrderSort((s) => ({
                          key: 'total',
                          dir: s.dir === 'asc' ? 'desc' : 'asc',
                        }))
                      }
                      tabIndex={0}
                    >
                      Total
                    </th>
                    <th scope="col" className="py-2 px-3">
                      Status
                    </th>
                    <th
                      scope="col"
                      className="py-2 px-3 cursor-pointer"
                      onClick={() =>
                        setOrderSort((s) => ({
                          key: 'createdAt',
                          dir: s.dir === 'asc' ? 'desc' : 'asc',
                        }))
                      }
                      tabIndex={0}
                    >
                      Date
                    </th>
                    <th scope="col" className="py-2 px-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8 text-gray-400"
                      >
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(
                      (order: Order & { customer: string }) => (
                        <tr
                          key={order.id}
                          className={`border-b hover:bg-red-50 dark:hover:bg-neutral-700 transition ${highlightedOrderId === order.id ? 'bg-green-100 dark:bg-green-900 animate-pulse' : ''}`}
                        >
                          <td className="py-2 px-3 font-mono text-xs">
                            {order.id}
                          </td>
                          <td className="py-2 px-3 text-left align-middle">
                            {order.customer}
                          </td>
                          <td className="py-2 px-3 font-semibold text-left align-middle">
                            {formatVND(order.total)}
                          </td>
                          <td className="py-2 px-3 text-left align-middle">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${statusColor[order.status] || 'bg-gray-100 text-gray-700'}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-left align-middle">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex gap-2">
                              <button
                                className="px-2 py-1 rounded bg-gray-100 dark:bg-neutral-700 hover:bg-red-100 dark:hover:bg-neutral-600 text-xs font-medium text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus:outline-none"
                                onClick={() => {
                                  // setSelectedOrder(order); // Removed as per edit hint
                                  // setDrawerOpen(true); // Removed as per edit hint
                                }}
                                aria-label={`View order ${order.id}`}
                              >
                                View
                              </button>
                              <div className="relative group">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      className="px-2 py-1 rounded bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 text-xs font-medium flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-red-500 focus:outline-none"
                                      aria-label="Update Status"
                                    >
                                      Update{' '}
                                      <MoreHorizontal
                                        className="w-3 h-3"
                                        aria-hidden="true"
                                      />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    sideOffset={8}
                                    align="start"
                                    className="min-w-[140px]"
                                  >
                                    {[
                                      'PENDING',
                                      'PAID',
                                      'SHIPPED',
                                      'DELIVERED',
                                      'CANCELLED',
                                    ].map((s) => (
                                      <DropdownMenuItem
                                        key={s}
                                        disabled={
                                          order.status === s ||
                                          updatingOrderId === order.id
                                        }
                                        onSelect={async () => {
                                          setUpdatingOrderId(order.id);
                                          filteredOrders = filteredOrders.map(
                                            (
                                              o: Order & { customer: string },
                                            ) =>
                                              o.id === order.id
                                                ? { ...o, status: s }
                                                : o,
                                          );
                                          try {
                                            const res = await fetch(
                                              '/api/orders',
                                              {
                                                method: 'PATCH',
                                                headers: {
                                                  'Content-Type':
                                                    'application/json',
                                                },
                                                body: JSON.stringify({
                                                  id: order.id,
                                                  status: s,
                                                }),
                                              },
                                            );
                                            if (!res.ok)
                                              throw new Error(
                                                'Failed to update',
                                              );
                                            showToast(
                                              'Order status updated!',
                                              'success',
                                            );
                                          } catch {
                                            showToast(
                                              'Failed to update order status',
                                              'error',
                                            );
                                          } finally {
                                            setUpdatingOrderId(null);
                                          }
                                        }}
                                        aria-label={`Set status to ${s}`}
                                      >
                                        {updatingOrderId === order.id && (
                                          <Loader
                                            className="w-3 h-3 animate-spin mr-1"
                                            aria-label="Updating"
                                          />
                                        )}
                                        {s}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ),
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
      {/* Low Stock Alerts */}
      <section aria-label="Low Stock Alerts" className="px-2 sm:px-4">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow p-4 sm:p-6 mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h2 className="text-lg font-bold">Low Stock Alerts</h2>
          </div>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => exportLowStockCSV(lowStockProducts)}
              className="px-3 py-1 rounded bg-green-600 text-white text-xs font-medium hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-500 focus:outline-none"
            >
              Export CSV
            </button>
            <button
              onClick={() => exportLowStockPDF(lowStockProducts)}
              className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none"
            >
              Export PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-gray-600 dark:text-gray-300">
                  <th className="py-2 px-3 text-left align-middle">Product</th>
                  <th className="py-2 px-3">Current Stock</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">
                      No low stock products.
                    </td>
                  </tr>
                ) : (
                  lowStockProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b hover:bg-gray-50 dark:hover:bg-neutral-700 transition"
                    >
                      <td className="py-2 px-3 flex items-center gap-3">
                        <Image
                          src={product.images?.[0] || '/images/fallback.png'}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded object-cover border"
                        />
                        <span className="font-semibold">{product.name}</span>
                      </td>
                      <td className="py-2 px-3 font-semibold">
                        {product.quantity ?? 0}
                      </td>
                      <td className="py-2 px-3 text-left align-middle">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${(product.quantity ?? 0) < 3 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}
                        >
                          {(product.quantity ?? 0) < 3 ? 'Critical' : 'Low'}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <button className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition">
                          Restock
                        </button>
                        <button className="ml-2 px-3 py-1 rounded bg-gray-100 dark:bg-neutral-700 text-xs font-medium hover:bg-gray-200 dark:hover:bg-neutral-600 transition">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {/* Top Products */}
      <section aria-label="Top Products" className="px-2 sm:px-4">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow p-4 sm:p-6 mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h2 className="text-lg font-bold">Top Products</h2>
          </div>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => exportTopProductsCSV(topProducts)}
              className="px-3 py-1 rounded bg-green-600 text-white text-xs font-medium hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-500 focus:outline-none"
            >
              Export CSV
            </button>
            <button
              onClick={() => exportTopProductsPDF(topProducts)}
              className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none"
            >
              Export PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-gray-600 dark:text-gray-300">
                  <th className="py-2 px-3 text-left align-middle">Product</th>
                  <th className="py-2 px-3">Units Sold</th>
                  <th className="py-2 px-3">Revenue</th>
                  <th className="py-2 px-3">Stock</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">
                      No sales data.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((product) => (
                    <tr
                      key={product.name}
                      className="border-b hover:bg-gray-50 dark:hover:bg-neutral-700 transition"
                    >
                      <td className="py-2 px-3 flex items-center gap-3">
                        <Image
                          src={product.image || '/images/fallback.png'}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded object-cover border"
                        />
                        <span className="font-semibold">{product.name}</span>
                      </td>
                      <td className="py-2 px-3 font-semibold">
                        {product.unitsSold}
                      </td>
                      <td className="py-2 px-3 font-semibold text-green-700">
                        {formatVND(product.revenue)}
                      </td>
                      <td className="py-2 px-3 text-left align-middle">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${product.stock < 3 ? 'bg-red-100 text-red-800' : product.stock < 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
                        >
                          {product.stock < 3
                            ? 'Critical'
                            : product.stock < 10
                              ? 'Low'
                              : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Optional: Horizontal bar chart for revenue */}
          {topProducts.length > 0 && (
            <div className="h-56 w-full mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProducts.slice().reverse()}
                  layout="vertical"
                  margin={{ left: 40, right: 24, top: 8, bottom: 8 }}
                >
                  <XAxis type="number" dataKey="revenue" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 13 }}
                  />
                  <RechartsTooltip formatter={(v) => formatVND(Number(v))} />
                  <Bar
                    dataKey="revenue"
                    radius={[0, 8, 8, 0]}
                    isAnimationActive={false}
                  >
                    {topProducts
                      .slice()
                      .reverse()
                      .map((product) => (
                        <Cell
                          key={product.name}
                          fill={
                            PRODUCT_COLORS[hashStringToColorIdx(product.name)]
                          }
                          aria-label={`Color for ${product.name}`}
                        />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Color legend for accessibility */}
              <div className="flex flex-wrap gap-3 mt-4">
                {topProducts.map((product) => (
                  <div
                    key={product.name}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className="inline-block w-4 h-4 rounded"
                      style={{
                        background:
                          PRODUCT_COLORS[hashStringToColorIdx(product.name)],
                      }}
                      aria-label={`Color for ${product.name}`}
                    />
                    <span>{product.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      {/* Customer Insights */}
      <section aria-label="Customer Insights" className="px-2 sm:px-4">
        {/* Revenue Trend Chart (full width) */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow p-4 sm:p-6 mt-8 mb-8">
          <h2 className="text-lg font-bold mb-4">Revenue Trend</h2>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <BarChart2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Revenue trend chart will be implemented here</p>
              <p className="text-sm text-gray-400 mt-2">Showing daily/weekly/monthly revenue trends</p>
            </div>
          </div>
        </div>
        {/* 2-column grid for Top Customers and Acquisition Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Customers by Revenue */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow p-4 sm:p-6">
            <h2 className="text-lg font-bold mb-4">Top Customers by Revenue</h2>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-gray-600 dark:text-gray-300">
                  <th className="py-2 px-3 text-left align-middle">Name</th>
                  <th className="py-2 px-3 text-left align-middle">Email</th>
                  <th className="py-2 px-3 text-left align-middle">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c) => (
                  <tr
                    key={c.email}
                    className="border-b hover:bg-gray-50 dark:hover:bg-neutral-700 transition"
                  >
                    <td className="py-2 px-3 font-semibold text-left align-middle">
                      {c.name}
                    </td>
                    <td className="py-2 px-3 text-left align-middle">
                      {c.email}
                    </td>
                    <td className="py-2 px-3 font-semibold text-green-700 text-left align-middle">
                      {formatVND(c.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Customer Acquisition Sources Pie Chart */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow p-4 sm:p-6 flex flex-col items-center overflow-visible min-h-[320px]">
            <h2 className="text-lg font-bold mb-4">
              Customer Acquisition Sources
            </h2>
            <PieChart width={340} height={260}>
              <Pie
                data={acquisitionSources}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={60}
                label={false}
              >
                {acquisitionSources.map((entry, idx) => (
                  <RechartsCell
                    key={`cell-src-${idx}`}
                    fill={ACQUISITION_COLORS[idx % ACQUISITION_COLORS.length]}
                  />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value, name, props) => [value, props.payload.name]}
              />
              <RechartsLegend
                layout="vertical"
                align="right"
                verticalAlign="middle"
              />
            </PieChart>
          </div>
        </div>
      </section>
      {/* Reports & Export */}
      <section aria-label="Reports & Export" className="px-2 sm:px-4">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow p-4 sm:p-6 mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h2 className="text-lg font-bold">Reports & Export</h2>
          </div>
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
            <div>
              <label
                htmlFor="export-start-date"
                className="block text-sm font-medium mb-1"
              >
                Start Date
              </label>
              <input
                type="date"
                id="export-start-date"
                value={exportStart}
                onChange={(e) => setExportStart(e.target.value)}
                className="border rounded px-2 py-1 text-sm bg-gray-50 dark:bg-neutral-700 text-gray-700 dark:text-gray-200 focus-visible:ring-2 focus-visible:ring-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="export-end-date"
                className="block text-sm font-medium mb-1"
              >
                End Date
              </label>
              <input
                type="date"
                id="export-end-date"
                value={exportEnd}
                onChange={(e) => setExportEnd(e.target.value)}
                className="border rounded px-2 py-1 text-sm bg-gray-50 dark:bg-neutral-700 text-gray-700 dark:text-gray-200 focus-visible:ring-2 focus-visible:ring-red-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-500 focus:outline-none"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExportPDF()}
                className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none"
              >
                Export PDF
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-gray-600 dark:text-gray-300">
                  <th className="py-2 px-3 text-left align-middle">Order ID</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3">Total</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredExportOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No orders in range.
                    </td>
                  </tr>
                ) : (
                  filteredExportOrders.map(
                    (o: Order & { customer: string }) => (
                      <tr
                        key={o.id}
                        className="border-b hover:bg-gray-50 dark:hover:bg-neutral-700 transition"
                      >
                        <td className="py-2 px-3 font-mono text-xs">{o.id}</td>
                        <td className="py-2 px-3 text-left align-middle">
                          {o.customer}
                        </td>
                        <td className="py-2 px-3 font-semibold text-left align-middle">
                          {formatVND(o.total)}
                        </td>
                        <td className="py-2 px-3 text-left align-middle">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${statusColor[o.status] || 'bg-gray-100 text-gray-700'}`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-left align-middle">
                          {format(parseISO(o.createdAt), 'yyyy-MM-dd HH:mm')}
                        </td>
                      </tr>
                    ),
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
