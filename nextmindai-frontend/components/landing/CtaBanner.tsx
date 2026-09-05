"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function CtaBanner() {
  const { user, loading } = useAuth();
  const href = !loading && user ? "/chat" : "/register";

  return (
    <section className="relative bg-[#060F0C] pb-20 md:pb-28 pt-4">
      <div className="mx-auto max-w-[1120px] px-5">
        <div className="relative overflow-hidden rounded-3xl bg-[#D4F53C] px-8 py-14 md:p-16 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(6,15,12,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(6,15,12,0.6) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage: "radial-gradient(ellipse 70% 90% at 50% 50%, black 20%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 90% at 50% 50%, black 20%, transparent 75%)",
            }}
          />
          <div className="pointer-events-none absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-white/25 blur-[100px]" />
          <div className="relative">
            <h2 className="text-[30px] md:text-[44px] font-semibold tracking-tight text-[#060F0C] mb-4">
              Your documents have answers.
              <br />
              Start asking.
            </h2>
            <p className="text-[15px] text-[#060F0C]/70 mb-8 max-w-[440px] mx-auto">
              Create a free workspace, upload your first files, and chat with them in minutes.
            </p>
            <Link
              href={href}
              className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-[#060F0C] text-[#F2FFEE] text-[14px] font-semibold hover:bg-[#1A4435] transition-colors shadow-xl"
            >
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-[12px] text-[#060F0C]/60 mt-4">
              Free to start · Your own API keys · No credit card
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
