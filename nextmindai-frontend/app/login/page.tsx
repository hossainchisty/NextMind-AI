"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, Quote } from "lucide-react";
import { BrainNodeIcon } from "@/components/ui/Icons";
import Button from "@/components/ui/Button";
import GoogleButton from "@/components/auth/GoogleButton";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/chat");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? (err as { message: string }).message : "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Brand panel */}
      <div className="hidden lg:flex w-[46%] relative bg-[#0D2B22] flex-col justify-between p-12 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#D4F53C]/10 blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#1A4435] blur-[100px]" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(159,206,190,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(159,206,190,0.2) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(ellipse 80% 70% at 20% 20%, black 20%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 20% 20%, black 20%, transparent 75%)",
            }}
          />
        </div>
        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-[10px] bg-[#D4F53C] text-[#060F0C] flex items-center justify-center">
            <BrainNodeIcon className="w-5 h-5" />
          </span>
          <span className="text-[16px] font-semibold tracking-tight text-[#F2FFEE]">
            Next<span className="text-[#D4F53C]">Mind</span>
          </span>
        </Link>
        <div className="relative">
          <Quote className="w-8 h-8 text-[#D4F53C]/60 mb-5" />
          <p className="text-[26px] leading-snug font-medium tracking-tight text-[#F2FFEE] mb-6 max-w-[420px]">
            Your documents already know the answers. Start asking.
          </p>
          <div className="flex items-center gap-6 text-[13px] text-[#9FCEBE]">
            <span><strong className="text-[#F2FFEE]">8</strong> file types</span>
            <span><strong className="text-[#F2FFEE]">23+</strong> AI providers</span>
            <span><strong className="text-[#F2FFEE]">100%</strong> cited answers</span>
          </div>
        </div>
        <p className="relative text-[12px] text-[#9FCEBE]/60">
          Private by architecture · Nothing trains on your data
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 overflow-y-auto">
        <div className="w-full max-w-[380px] py-10 animate-fade-in">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <h1 className="text-[26px] font-semibold tracking-tight text-text-primary">Welcome back</h1>
          <p className="text-[14px] text-text-secondary mt-1.5 mb-6">Sign in to your knowledge workspace</p>

          <GoogleButton onError={(msg) => setError(msg)} />

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-text-secondary">or continue with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[13px]">{error}</div>
            )}
            <div>
              <label className="block text-[13px] font-medium text-text-primary mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full h-11 px-3.5 rounded-[10px] bg-surface border border-border text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-primary mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full h-11 pl-3.5 pr-11 rounded-[10px] bg-surface border border-border text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-text-secondary/60 hover:text-text-primary hover:bg-bg transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-[13px] text-text-secondary mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline underline-offset-2">
              Sign up
            </Link>
          </p>
          <p className="text-center text-[11px] text-text-secondary/60 mt-8">
            Protected by encrypted storage ·{" "}
            <Link href="/privacy" className="hover:text-text-secondary">Privacy</Link>
            {" · "}
            <Link href="/terms" className="hover:text-text-secondary">Terms</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
