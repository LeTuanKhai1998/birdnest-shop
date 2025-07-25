"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Signup failed");
      toast.error(data.error || "Signup failed");
      return;
    }
    toast.success("Account created! Please sign in.");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 mt-16">
        <h1 className="text-2xl font-bold mb-6 text-center">Create your account</h1>
        <form className="space-y-4" onSubmit={handleSignup}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <Input id="name" type="text" autoComplete="name" required value={name} onChange={e => setName(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
              <button type="button" className="absolute right-2 top-2 text-gray-500" tabIndex={-1} onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm border border-red-200 animate-fade-in">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full text-base font-semibold py-3 mt-2" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Sign up
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <a href="/login" className="text-red-600 hover:underline">Sign in</a>
        </div>
      </div>
    </div>
  );
} 