import React from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';

export type UserTableProps = {
  users: Array<{
    id: string;
    name?: string | null;
    email: string;
    isAdmin: boolean;
  }>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRoleChange: (id: string, isAdmin: boolean) => void;
};

export function UserTable({
  users,
  onEdit,
  onDelete,
  onRoleChange,
}: UserTableProps) {
  return (
    <table className="min-w-full bg-white rounded shadow text-sm">
      <thead>
        <tr>
          <th className="px-4 py-2">ID</th>
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Email</th>
          <th className="px-4 py-2">Role</th>
          <th className="px-4 py-2">Status</th>
          <th className="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id} className="border-t">
            <td className="px-4 py-2">{u.id}</td>
            <td className="px-4 py-2">{u.name || u.email}</td>
            <td className="px-4 py-2">{u.email}</td>
            <td className="px-4 py-2">
              <select
                className="border rounded px-2 py-1 text-xs"
                value={u.isAdmin ? 'admin' : 'user'}
                onChange={(e) => onRoleChange(u.id, e.target.value === 'admin')}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </td>
            <td className="px-4 py-2">
              <StatusBadge status={u.isAdmin ? 'ADMIN' : 'USER'} />
            </td>
            <td className="px-4 py-2 flex gap-2">
              <button
                className="bg-blue-500 text-white rounded px-3 py-1 text-xs"
                onClick={() => onEdit(u.id)}
                style={{ minWidth: 44, minHeight: 44 }}
              >
                Edit
              </button>
              <button
                className="bg-red-500 text-white rounded px-3 py-1 text-xs"
                onClick={() => onDelete(u.id)}
                style={{ minWidth: 44, minHeight: 44 }}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
