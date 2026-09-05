"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "What file types can I upload?",
    a: "PDF, DOCX, TXT, CSV, Markdown, XLSX, JSON, and HTML — up to 100 MB per file and 40 files per batch. If a source file changes later, re-upload it and the index rebuilds automatically.",
  },
  {
    q: "Which AI models can I use?",
    a: "Any of 23+ providers via your own API keys — OpenAI, Anthropic, Gemini, DeepSeek, Qwen, and more, including free tiers. You pick a model per chat and can switch any time.",
  },
  {
    q: "Is my data used to train models?",
    a: "No. Your files live in private storage, indexing runs in-house, and only your question plus retrieved passages go to the provider you connected. Provider keys are encrypted at rest.",
  },
  {
    q: "How do citations work?",
    a: "Hybrid search plus a reranker select the top passages behind every answer, each cited with its document and page so you can verify instead of trust.",
  },
  {
    q: "Can I organize documents into groups?",
    a: "Yes — collections act as retrieval boundaries. Scope any chat to a collection and search runs only on that collection's chunks.",
  },
  {
    q: "How do I export or delete my data?",
    a: "Settings → Advanced offers a one-click JSON export of everything you own, and a Danger Zone that purges your account, files, and index entries.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative bg-[#F2FFEE] py-20 md:py-28 scroll-mt-20">
      <div className="mx-auto max-w-[760px] px-5">
        <p className="text-[12px] font-semibold tracking-[0.2em] text-[#2A7D5F] uppercase mb-3 text-center">
          FAQ
        </p>
        <h2 className="text-[30px] md:text-[40px] font-semibold tracking-tight text-[#0D2B22] mb-10 text-center">
          Questions, answered
        </h2>
        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className={`rounded-2xl border transition-all ${
                  isOpen
                    ? "border-[#2A7D5F]/40 bg-white shadow-[0_8px_32px_rgba(13,43,34,0.08)]"
                    : "border-[#0D2B22]/10 bg-white/70 hover:border-[#2A7D5F]/25"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-[15px] font-semibold text-[#0D2B22]">{f.q}</span>
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isOpen ? "bg-[#0D2B22] text-[#D4F53C] rotate-45" : "bg-[#0D2B22]/5 text-[#0D2B22]"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </span>
                </button>
                {isOpen && (
                  <p className="px-6 pb-6 text-[14px] leading-relaxed text-[#0D2B22]/70 animate-fade-in">
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
