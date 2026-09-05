"use client";

import Link from "next/link";
import { ArrowRight, KeyRound, UserCheck, Cpu, Trash2, ShieldCheck } from "lucide-react";

const items = [
  {
    icon: KeyRound,
    title: "Encrypted API keys",
    body: "Provider keys are Fernet-encrypted at rest, masked in the UI.",
  },
  {
    icon: UserCheck,
    title: "Owner-only access",
    body: "Every file, chat, and key is scoped to your account.",
  },
  {
    icon: Cpu,
    title: "Local indexing",
    body: "Parsing, embeddings, and reranking run in-house.",
  },
  {
    icon: Trash2,
    title: "Real deletion",
    body: "Delete a file or your whole account — purged, not hidden.",
  },
];

export default function Security() {
  return (
    <section id="security" className="relative bg-[#060F0C] py-20 md:py-28 scroll-mt-20 border-y border-white/5 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[280px] rounded-full bg-[#D4F53C]/[0.07] blur-[100px]" />
      <div className="relative mx-auto max-w-[1120px] px-5">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.2em] text-[#D4F53C] uppercase mb-3">
              Security
            </p>
            <h2 className="text-[30px] md:text-[40px] font-semibold tracking-tight text-[#F2FFEE] max-w-[520px]">
              Your data, defended by design
            </h2>
          </div>
          <Link
            href="/security"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-white/15 bg-white/5 backdrop-blur-md text-[13px] font-medium text-[#F2FFEE] hover:bg-white/10 transition-colors"
          >
            Security overview <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 hover:bg-white/[0.07] hover:border-[#D4F53C]/30 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#D4F53C] text-[#060F0C] flex items-center justify-center mb-4 shadow-[0_0_24px_rgba(212,245,60,0.25)] ring-1 ring-white/20">
                <Icon className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className="text-[15px] font-semibold text-[#F2FFEE] mb-2">{title}</h3>
              <p className="text-[13px] leading-relaxed text-[#9FCEBE]">{body}</p>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <Link
          href="/gdpr"
          className="group flex items-center gap-4 rounded-2xl border border-[#D4F53C]/25 bg-[#D4F53C]/[0.06] backdrop-blur-xl px-6 py-5 hover:bg-[#D4F53C]/[0.1] transition-all"
        >
          <span className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-[0_0_24px_rgba(212,245,60,0.25)] ring-1 ring-white/20 bg-white">
            <img
              src="/badges/gdpr-badge.jpg"
              alt="GDPR emblem"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-semibold text-[#F2FFEE]">
              GDPR Ready
            </span>
            <span className="block text-[13px] text-[#9FCEBE]">
              Data rights, self-serve export &amp; deletion, and a documented compliance program.
            </span>
          </span>
          <ArrowRight className="w-5 h-5 text-[#D4F53C] shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          href="/security"
          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl px-6 py-5 hover:bg-white/[0.07] transition-all"
        >
          <img
            src="/badges/iso-27001-certified.png"
            alt="ISO/IEC 27001 Certified badge"
            loading="lazy"
            className="w-12 h-12 rounded-full object-cover ring-1 ring-white/20 shrink-0 bg-white"
          />
          <span className="flex-1">
            <span className="block text-[15px] font-semibold text-[#F2FFEE]">
              ISO/IEC 27001 Certified
            </span>
            <span className="block text-[13px] text-[#9FCEBE]">
              Information security management, independently certified.
            </span>
          </span>
          <ArrowRight className="w-5 h-5 text-[#D4F53C] shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>
        </div>
      </div>
    </section>
  );
}
