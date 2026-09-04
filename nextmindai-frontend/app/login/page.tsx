"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? (err as { message: string }).message : "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-bg items-center justify-center">
      <div className="w-full max-w-[380px] px-6">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mx-auto mb-4">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="6" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="18" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/></svg>
          </div>
          <h1 className="text-[22px] font-semibold text-text-primary">Welcome back</h1>
          <p className="text-[14px] text-text-secondary mt-1">Sign in to your knowledge workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[13px]">{error}</div>
          )}
          <div>
            <label className="block text-[13px] font-medium text-text-primary mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-[10px] bg-surface border border-border text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/5 transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text-primary mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-[10px] bg-surface border border-border text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/5 transition-all"
              placeholder="Your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-[10px] bg-primary text-white text-[13px] font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-[13px] text-text-secondary mt-6">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-primary hover:text-primary-light transition-colors font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
