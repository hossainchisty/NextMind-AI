"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Blocks, KeyRound } from "lucide-react";
import SitePage from "@/components/landing/SitePage";

const values = [
  {
    icon: ShieldCheck,
    title: "Private by architecture",
    body: "Your files live in isolated cloud storage and your AI calls run on your own provider keys. Privacy isn't a policy page — it's how the system is built.",
  },
  {
    icon: Blocks,
    title: "Retrieval done right",
    body: "Hybrid search, reciprocal rank fusion, and cross-encoder reranking. We sweat the pipeline so answers come back grounded and cited.",
  },
  {
    icon: KeyRound,
    title: "No lock-in, ever",
    body: "Twenty-three providers, switchable per chat, at direct provider prices. Your knowledge stays portable and your models stay your choice.",
  },
];

export default function AboutPage() {
  return (
    <SitePage>
      <section className="relative overflow-hidden pt-36 pb-14">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[560px] h-[280px] rounded-full bg-[#2A7D5F]/10 blur-[100px]" />
        <div className="relative mx-auto max-w-[1120px] px-5">
          <p className="text-[12px] font-semibold tracking-[0.2em] text-[#2A7D5F] uppercase mb-3">
            About
          </p>
          <h1 className="text-[36px] md:text-[48px] font-semibold tracking-tight text-[#0D2B22] mb-4 max-w-[640px]">
            Your documents already know the answers.
          </h1>
          <p className="text-[16px] leading-relaxed text-[#0D2B22]/65 max-w-[560px]">
            NextMind is a private AI knowledge workspace. Teams upload the PDFs,
            spreadsheets, handbooks, and notes they live in — and get back answers
            with citations, from any AI model they choose.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-[1120px] px-5 grid sm:grid-cols-3 gap-4">
          {[
            { value: "8", label: "file types parsed & chunked" },
            { value: "23+", label: "AI providers supported" },
            { value: "100%", label: "answers grounded in your files" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl p-6 text-center"
            >
              <div className="text-[32px] font-semibold text-[#0D2B22]">{s.value}</div>
              <div className="text-[13px] text-[#0D2B22]/60 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-[1120px] px-5">
          <h2 className="text-[26px] font-semibold tracking-tight text-[#0D2B22] mb-8">
            What we believe
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {values.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0D2B22] text-[#D4F53C] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#0D2B22] mb-2">{title}</h3>
                <p className="text-[13px] leading-relaxed text-[#0D2B22]/65">{body}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl bg-[#0D2B22] px-8 py-12 text-center">
            <h2 className="text-[26px] md:text-[32px] font-semibold tracking-tight text-[#F2FFEE] mb-3">
              See what your files know
            </h2>
            <p className="text-[14px] text-[#9FCEBE] mb-6">
              Free to start. Upload your first documents in minutes.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#D4F53C] text-[#060F0C] text-[14px] font-semibold hover:bg-[#E0FF52] transition-colors"
            >
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
