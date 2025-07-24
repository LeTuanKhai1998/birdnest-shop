"use client";
import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff, Github, Mail, Loader2 } from "lucide-react";

function LoginPageInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });
    setLoading(false);
    console.log("[LOGIN] Request:", { email, password });
    console.log("[LOGIN] Response:", res);
    if (res?.error) {
      toast.error("Sign in failed: " + res.error);
    } else if (!res?.ok) {
      toast.error("Sign in failed: Unknown error");
    } else if (res.url) {
      router.push(res.url);
    }
  };

  const handleSocial = async (provider: string) => {
    setLoading(true);
    await signIn(provider, { callbackUrl });
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const res = await signIn("credentials", {
      email: "demo@demo.com",
      password: "Demo@1234",
      callbackUrl,
      redirect: false,
    });
    setLoading(false);
    console.log("[DEMO LOGIN] Response:", res);
    if (res?.error) {
      toast.error("Demo login failed: " + res.error);
    } else if (!res?.ok) {
      toast.error("Demo login failed: Unknown error");
    } else if (res.url) {
      router.push(res.url);
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);
    const res = await signIn("credentials", {
      email: "user@example.com",
      password: "123456",
      callbackUrl,
      redirect: false,
    });
    setLoading(false);
    console.log("[TEST LOGIN] Response:", res);
    if (res?.error) {
      toast.error("Test login failed: " + res.error);
    } else if (!res?.ok) {
      toast.error("Test login failed: Unknown error");
    } else if (res.url) {
      router.push(res.url);
    }
  };

  return (
    <div className="flex justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 mt-16">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign in to your account</h1>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
              <button type="button" className="absolute right-2 top-2 text-gray-500" tabIndex={-1} onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full text-base font-semibold py-3 mt-2" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Sign in
          </Button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => handleSocial("google")} disabled={loading}>
            <Mail className="w-5 h-5" /> Sign in with Google
          </Button>
          <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => handleSocial("github")} disabled={loading}>
            <Github className="w-5 h-5" /> Sign in with GitHub
          </Button>
          <Button variant="secondary" className="w-full flex items-center justify-center gap-2" onClick={handleDemoLogin} disabled={loading}>
            🚀 Demo Login
          </Button>
          <Button variant="secondary" className="w-full flex items-center justify-center gap-2" onClick={handleTestLogin} disabled={loading}>
           🧪 Test Login (user@example.com / 123456)
         </Button>
        </div>
        <div className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account? <a href="/signup" className="text-red-600 hover:underline">Sign up</a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
} 