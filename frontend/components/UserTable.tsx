import React, { useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.ceil(users.length / pageSize);
  const paginatedUsers = users.slice((page - 1) * pageSize, page * pageSize);
  return (
    <>
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
          {paginatedUsers.map((u) => (
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
        <div>
          <label htmlFor="user-page-size" className="mr-2 text-sm">Rows per page:</label>
          <select
            id="user-page-size"
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="border rounded px-2 py-1 text-sm"
          >
            {[10, 20, 50].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} aria-disabled={page === 1} />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink isActive={page === i + 1} onClick={() => setPage(i + 1)}>{i + 1}</PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))} aria-disabled={page === totalPages} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
}
