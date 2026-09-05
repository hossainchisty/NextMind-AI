"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, Quote, Check } from "lucide-react";
import { BrainNodeIcon } from "@/components/ui/Icons";
import Button from "@/components/ui/Button";

function passwordScore(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^a-zA-Z0-9]/.test(pw)) score += 1;
  return Math.min(score, 4);
}

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["", "bg-red-500", "bg-amber-500", "bg-accent-green", "bg-accent-green"];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const score = passwordScore(password);
  const matches = passwordConfirm.length > 0 && password === passwordConfirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register(email, name, password, passwordConfirm);
      router.push("/chat");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? (err as { message: string }).message : "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full h-11 px-3.5 rounded-[10px] bg-surface border border-border text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all";

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
            Your second brain for everything you read.
          </p>
          <ul className="space-y-2.5 text-[13px] text-[#9FCEBE]">
            {["Upload PDFs, sheets, docs and notes", "Chat with cited, verifiable answers", "Use any AI model with your own keys"].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#D4F53C] shrink-0" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-[12px] text-[#9FCEBE]/60">
          Free to start · No credit card · Cancel anytime
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
          <h1 className="text-[26px] font-semibold tracking-tight text-text-primary">Create account</h1>
          <p className="text-[14px] text-text-secondary mt-1.5 mb-8">Start your private AI workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[13px]">{error}</div>
            )}
            <div>
              <label className="block text-[13px] font-medium text-text-primary mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className={inputCls}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-primary mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputCls}
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
                  minLength={8}
                  autoComplete="new-password"
                  className={`${inputCls} pr-11`}
                  placeholder="Min 8 characters"
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
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? strengthColors[score] : "bg-border"}`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-text-secondary w-12 text-right">
                    {strengthLabels[score]}
                  </span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-primary mb-1.5">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className={`${inputCls} ${passwordConfirm.length > 0 ? (matches ? "border-accent-green/50" : "border-red-400/60") : ""}`}
                placeholder="Repeat password"
              />
              {passwordConfirm.length > 0 && !matches && (
                <p className="text-[11px] text-red-500 mt-1.5">Passwords do not match</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-[13px] text-text-secondary mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline underline-offset-2">
              Sign in
            </Link>
          </p>
          <p className="text-center text-[11px] text-text-secondary/60 mt-8">
            By signing up you agree to our{" "}
            <Link href="/terms" className="hover:text-text-secondary">Terms</Link>
            {" and "}
            <Link href="/privacy" className="hover:text-text-secondary">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
