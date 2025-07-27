"use client";
import React from "react";
import useSWR from "swr";
import { UserCard } from "@/components/UserCard";
import { UserTable } from "@/components/UserTable";
import { toast } from "sonner";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  role: string;
  status: string;
  createdAt?: string;
  lastLoginAt?: string | null;
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminUsersPage() {
  const { data, mutate, isLoading } = useSWR("/api/users", fetcher);
  const users = data?.users || [];

  const handleRoleChange = async (id: string, isAdmin: boolean) => {
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isAdmin }),
    });
    if (res.ok) {
      toast.success("Role updated");
      mutate();
    } else {
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    const res = await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("User deleted");
      mutate();
    } else {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      {isLoading && <div>Loading...</div>}
      {!isLoading && (
        <>
          <div className="block lg:hidden">
            {users.map((user: AdminUser) => (
              <UserCard
                key={user.id}
                name={user.name}
                email={user.email}
                isAdmin={user.isAdmin}
                onEdit={() => toast.info("Edit not implemented")}
                onDelete={() => handleDelete(user.id)}
                onRoleChange={isAdmin => handleRoleChange(user.id, isAdmin)}
              />
            ))}
          </div>
          <div className="hidden lg:block">
            <UserTable
              users={users}
              onEdit={() => toast.info("Edit not implemented")}
              onDelete={handleDelete}
              onRoleChange={handleRoleChange}
            />
          </div>
        </>
      )}
    </div>
  );
} 