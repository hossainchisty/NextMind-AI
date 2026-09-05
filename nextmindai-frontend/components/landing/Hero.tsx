"use client";

import Link from "next/link";
import { ArrowRight, Play, FileText, Quote, Sparkles } from "lucide-react";
import { BrainNodeIcon } from "@/components/ui/Icons";
import { useAuth } from "@/lib/auth";

const stats = [
  { value: "8", label: "file types" },
  { value: "40", label: "files per batch" },
  { value: "100MB", label: "per file" },
  { value: "23+", label: "AI providers" },
];

export default function Hero() {
  const { user, loading } = useAuth();
  const primaryHref = !loading && user ? "/chat" : "/register";
  const primaryLabel = !loading && user ? "Open workspace" : "Start building free";

  return (
    <section className="relative overflow-hidden bg-[#060F0C]">
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full bg-[#D4F53C]/10 blur-[120px]" />
        <div className="absolute top-40 -left-40 w-[420px] h-[420px] rounded-full bg-[#1A4435]/60 blur-[100px]" />
        <div className="absolute bottom-0 -right-40 w-[420px] h-[420px] rounded-full bg-[#1A4435]/40 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(159,206,190,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(159,206,190,0.25) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1120px] px-5 pt-36 pb-16 md:pt-44 md:pb-24 grid md:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[12px] text-[#9FCEBE] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#D4F53C]" />
            Private AI knowledge workspace
          </div>
          <h1 className="text-[40px] md:text-[56px] leading-[1.05] font-semibold tracking-tight text-[#F2FFEE] mb-5">
            Chat with your
            <br />
            documents<span className="text-[#D4F53C]">.</span>
          </h1>
          <p className="text-[16px] leading-relaxed text-[#9FCEBE] mb-8 max-w-[440px]">
            Upload PDFs, spreadsheets, notes and more. NextMind indexes everything with
            hybrid search and answers with citations — using any AI provider you connect.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-[#D4F53C] text-[#060F0C] text-[14px] font-semibold hover:bg-[#E0FF52] transition-colors shadow-[0_0_32px_rgba(212,245,60,0.25)]"
            >
              {primaryLabel} <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-white/15 bg-white/5 backdrop-blur-md text-[14px] font-medium text-[#F2FFEE] hover:bg-white/10 transition-colors"
            >
              <Play className="w-4 h-4" /> See how it works
            </a>
          </div>
          <div className="grid grid-cols-4 gap-4 max-w-[440px]">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-[22px] font-semibold text-[#F2FFEE]">{s.value}</div>
                <div className="text-[11px] text-[#9FCEBE]/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Glass product mock */}
        <div className="relative animate-fade-in hidden md:block" style={{ animationDelay: "150ms" }}>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-8 h-8 rounded-[10px] bg-[#D4F53C] text-[#060F0C] flex items-center justify-center">
                <BrainNodeIcon className="w-5 h-5" />
              </span>
              <div>
                <div className="text-[13px] font-semibold text-[#F2FFEE]">NextMind</div>
                <div className="text-[11px] text-[#9FCEBE]/70">Engineering Handbook · 3 sources</div>
              </div>
              <span className="ml-auto text-[10px] font-semibold px-2 py-1 rounded-full bg-[#D4F53C]/15 text-[#D4F53C]">
                Gemini 2.5 Flash
              </span>
            </div>
            <div className="flex justify-end mb-3">
              <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md bg-[#D4F53C] text-[#060F0C] text-[13px]">
                What is our deploy process?
              </div>
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] text-[13px] leading-relaxed text-[#F2FFEE]/90">
              Deploys run on every merge to <span className="text-[#D4F53C]">main</span> via
              CI — staging first, then production after checks pass.
              <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-[#9FCEBE]">
                <Quote className="w-3 h-3" /> deploy-runbook.md · p.2
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-[#060F0C]/60 px-4 py-3">
              <span className="text-[13px] text-[#9FCEBE]/50 flex-1">Ask anything…</span>
              <span className="text-[11px] px-2 py-1 rounded-md bg-white/10 text-[#9FCEBE]">↵ send</span>
            </div>
          </div>

          {/* Floating chips */}
          <div className="absolute -left-8 top-16 animate-float rounded-xl border border-white/10 bg-white/[0.07] backdrop-blur-xl px-3.5 py-2.5 shadow-lg flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#D4F53C]" />
            <div>
              <div className="text-[12px] font-medium text-[#F2FFEE]">Q3-report.xlsx</div>
              <div className="text-[10px] text-[#9FCEBE]/70">Indexed · 42 chunks</div>
            </div>
          </div>
          <div className="absolute -right-4 bottom-20 animate-float-slow rounded-xl border border-white/10 bg-white/[0.07] backdrop-blur-xl px-3.5 py-2.5 shadow-lg">
            <div className="text-[12px] font-medium text-[#F2FFEE]">Hybrid + reranked</div>
            <div className="text-[10px] text-[#9FCEBE]/70">top 5 of 40 candidates</div>
          </div>
        </div>
      </div>
    </section>
  );
}
