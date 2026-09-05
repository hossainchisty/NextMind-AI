"use client";

import { Search, Files, FolderKanban, Cpu, KeyRound, Layers } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Hybrid search + reranking",
    body: "Semantic embeddings and BM25 keyword search fused with reciprocal rank fusion, then rescored by a cross-encoder — so the top 5 chunks are the most relevant.",
  },
  {
    icon: Files,
    title: "8 file types, zero friction",
    body: "PDF, DOCX, TXT, CSV, Markdown, XLSX, JSON and HTML. Up to 100 MB per file and 40 files per batch upload with live progress.",
  },
  {
    icon: FolderKanban,
    title: "Collections",
    body: "Group documents into focused knowledge bases — engineering docs, contracts, research — and scope any chat to one collection.",
  },
  {
    icon: Cpu,
    title: "Any model, per chat",
    body: "Connect your own API keys across 23+ providers and switch models per conversation. Free tiers included.",
  },
  {
    icon: KeyRound,
    title: "Your keys, your files",
    body: "Bring your own provider keys and keep documents in your own private cloud storage. Nothing trains on your data.",
  },
  {
    icon: Layers,
    title: "Cited answers",
    body: "Every answer carries source citations back to the exact document and page, so you can verify instead of trust.",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative bg-[#060F0C] py-20 md:py-28 scroll-mt-20">
      <div className="mx-auto max-w-[1120px] px-5">
        <p className="text-[12px] font-semibold tracking-[0.2em] text-[#D4F53C] uppercase mb-3">
          Features
        </p>
        <h2 className="text-[30px] md:text-[40px] font-semibold tracking-tight text-[#F2FFEE] mb-3 max-w-[560px]">
          Everything you need to talk to your knowledge
        </h2>
        <p className="text-[15px] text-[#9FCEBE] mb-12 max-w-[520px]">
          A complete retrieval pipeline and workspace — not another chatbot wrapper.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 hover:bg-white/[0.07] hover:border-[#D4F53C]/30 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D4F53C]/10 text-[#D4F53C] flex items-center justify-center mb-4 group-hover:bg-[#D4F53C] group-hover:text-[#060F0C] transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-[16px] font-semibold text-[#F2FFEE] mb-2">{title}</h3>
              <p className="text-[13px] leading-relaxed text-[#9FCEBE]">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
