export default function AdminOrdersPage() {
  const orders = [
    { id: 'o1', customer: 'Nguyễn Văn A', total: 3500000, status: 'PAID', date: '2024-07-24' },
    { id: 'o2', customer: 'Trần Thị B', total: 1800000, status: 'PENDING', date: '2024-07-23' },
    { id: 'o3', customer: 'Lê Minh C', total: 7000000, status: 'DELIVERED', date: '2024-07-22' },
  ];
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Order Management</h2>
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2">Order ID</th>
            <th className="px-4 py-2">Customer</th>
            <th className="px-4 py-2">Total</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t">
              <td className="px-4 py-2">{o.id}</td>
              <td className="px-4 py-2">{o.customer}</td>
              <td className="px-4 py-2">₫{o.total.toLocaleString()}</td>
              <td className="px-4 py-2">{o.status}</td>
              <td className="px-4 py-2">{o.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 