export default function AdminProductsPage() {
  const products = [
    { id: 'p1', name: 'Tổ yến tinh chế 100g', price: 3500000, stock: 12, category: 'Tinh chế' },
    { id: 'p2', name: 'Tổ yến thô 50g', price: 1800000, stock: 8, category: 'Thô' },
    { id: 'p3', name: 'Combo quà tặng 200g', price: 7000000, stock: 3, category: 'Combo' },
  ];
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Product Management</h2>
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Stock</th>
            <th className="px-4 py-2">Category</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="px-4 py-2">{p.id}</td>
              <td className="px-4 py-2">{p.name}</td>
              <td className="px-4 py-2">₫{p.price.toLocaleString()}</td>
              <td className="px-4 py-2">{p.stock}</td>
              <td className="px-4 py-2">{p.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 