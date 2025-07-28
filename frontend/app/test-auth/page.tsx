"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

export default function TestAuthPage() {
  const { session, status, isAuthenticated, isAdmin, user, backendToken } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Is Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}</p>
            <p><strong>Is Admin:</strong> {isAdmin ? "Yes" : "No"}</p>
            <p><strong>Has Backend Token:</strong> {backendToken ? "Yes" : "No"}</p>
          </div>
        </div>

        {isAuthenticated && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <div className="space-y-2">
              <p><strong>ID:</strong> {user?.id}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Name:</strong> {user?.name || "N/A"}</p>
              <p><strong>Admin:</strong> {user?.isAdmin ? "Yes" : "No"}</p>
            </div>
          </div>
        )}

        {backendToken && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Backend Token</h2>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono break-all">
              {backendToken.substring(0, 50)}...
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Data</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="flex gap-4">
          {!isAuthenticated ? (
            <Button asChild>
              <a href="/login">Go to Login</a>
            </Button>
          ) : (
            <Button onClick={handleLogout} variant="destructive">
              Logout
            </Button>
          )}
          
          <Button asChild variant="outline">
            <a href="/">Go to Home</a>
          </Button>
          
          {isAdmin && (
            <Button asChild variant="outline">
              <a href="/admin">Go to Admin Dashboard</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 