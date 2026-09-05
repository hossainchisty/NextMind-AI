"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrainNodeIcon } from "@/components/ui/Icons";
import { useAuth } from "@/lib/auth";

const links = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Providers", href: "#providers" },
  { label: "Security", href: "#security" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const { user, loading } = useAuth();

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-[1120px] px-5">
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-[#060F0C]/70 backdrop-blur-xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-[10px] bg-[#D4F53C] text-[#060F0C] flex items-center justify-center">
              <BrainNodeIcon className="w-5 h-5" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-[#F2FFEE]">
              Next<span className="text-[#D4F53C]">Mind</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[13px] text-[#9FCEBE] hover:text-[#F2FFEE] transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {!loading && user ? (
              <Link
                href="/chat"
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#D4F53C] text-[#060F0C] text-[13px] font-semibold hover:bg-[#E0FF52] transition-colors"
              >
                Open workspace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="h-9 px-4 rounded-xl text-[13px] font-medium text-[#9FCEBE] hover:text-[#F2FFEE] hover:bg-white/5 transition-colors hidden sm:inline-flex items-center"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#D4F53C] text-[#060F0C] text-[13px] font-semibold hover:bg-[#E0FF52] transition-colors"
                >
                  Get started <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
