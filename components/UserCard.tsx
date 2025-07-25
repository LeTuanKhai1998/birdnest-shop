import React from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";

export type UserCardProps = {
  id: string;
  name?: string | null;
  email: string;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRoleChange: (isAdmin: boolean) => void;
};

export function UserCard({ id, name, email, isAdmin, onEdit, onDelete, onRoleChange }: UserCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-lg">{name || email}</div>
          <div className="text-xs text-gray-500">{email}</div>
        </div>
        <StatusBadge status={isAdmin ? "ADMIN" : "USER"} />
      </div>
      <div className="flex gap-2 mt-2">
        <select
          className="border rounded px-2 py-1 text-xs"
          value={isAdmin ? "admin" : "user"}
          onChange={e => onRoleChange(e.target.value === "admin")}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button
          className="bg-blue-500 text-white rounded px-3 py-1 text-xs"
          onClick={onEdit}
          style={{ minWidth: 44, minHeight: 44 }}
        >
          Edit
        </button>
        <button
          className="bg-red-500 text-white rounded px-3 py-1 text-xs"
          onClick={onDelete}
          style={{ minWidth: 44, minHeight: 44 }}
        >
          Delete
        </button>
      </div>
    </div>
  );
} 