export default function AdminUsersPage() {
  const users = [
    { id: 'u1', name: 'Nguyễn Văn Quang', email: 'admin1@birdnest.vn', isAdmin: true },
    { id: 'u2', name: 'Trần Thị Mai', email: 'admin2@birdnest.vn', isAdmin: true },
    { id: 'u3', name: 'Lê Minh Tuấn', email: 'user1@birdnest.vn', isAdmin: false },
    { id: 'u4', name: 'Phạm Thị Hồng', email: 'user2@birdnest.vn', isAdmin: false },
  ];
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2">User ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Admin</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="px-4 py-2">{u.id}</td>
              <td className="px-4 py-2">{u.name}</td>
              <td className="px-4 py-2">{u.email}</td>
              <td className="px-4 py-2">{u.isAdmin ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 