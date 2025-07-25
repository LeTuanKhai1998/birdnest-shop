"use client";
import React, { useState } from "react";
import useSWR from "swr";
import { UserCard } from "@/components/UserCard";
import { UserTable } from "@/components/UserTable";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminUsersPage() {
  const { data, mutate, isLoading } = useSWR("/api/users", fetcher);
  const users = data?.users || [];
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    setDeletingId(id);
    const res = await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeletingId(null);
    if (res.ok) {
      toast.success("User deleted");
      mutate();
    } else {
      toast.error("Failed to delete user");
    }
  };

  // Responsive: show cards on mobile, table on desktop
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      {isLoading && <div>Loading...</div>}
      {!isLoading && (
        <>
          <div className="block lg:hidden">
            {users.map((u: any) => (
              <UserCard
                key={u.id}
                id={u.id}
                name={u.name}
                email={u.email}
                isAdmin={u.isAdmin}
                onEdit={() => toast.info("Edit not implemented")}
                onDelete={() => handleDelete(u.id)}
                onRoleChange={isAdmin => handleRoleChange(u.id, isAdmin)}
              />
            ))}
          </div>
          <div className="hidden lg:block">
            <UserTable
              users={users}
              onEdit={id => toast.info("Edit not implemented")}
              onDelete={handleDelete}
              onRoleChange={handleRoleChange}
            />
          </div>
        </>
      )}
    </div>
  );
} 