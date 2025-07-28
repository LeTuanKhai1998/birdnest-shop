"use client";
import React from "react";
import useSWR from "swr";
import { UserCard } from "@/components/UserCard";
import { UserTable } from "@/components/UserTable";
import { toast } from "sonner";
import { fetcher } from "@/lib/utils";
import { api } from "@/lib/api";

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

export default function AdminUsersPage() {
  const { data, mutate, isLoading } = useSWR("/v1/users", url => api.get(url.replace('/v1', '')));
  const users = data?.data?.results || [];

  const handleRoleChange = async (id: string, isAdmin: boolean) => {
    try {
      await api.put(`/users/${id}`, { isAdmin });
      toast.success("Role updated");
      mutate();
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted");
      mutate();
    } catch (error) {
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