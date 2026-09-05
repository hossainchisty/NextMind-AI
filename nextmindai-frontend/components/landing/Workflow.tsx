"use client";

import { useEffect, useState } from "react";
import { Upload, DatabaseZap, MessagesSquare } from "lucide-react";
import { api } from "@/lib/api";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload",
    body: "Drop in PDFs, spreadsheets, docs and notes — singly or 40 at a time. Files are parsed, cleaned and chunked automatically.",
  },
  {
    icon: DatabaseZap,
    step: "02",
    title: "Index",
    body: "Chunks are embedded and indexed for hybrid retrieval: semantic vectors plus keyword search, fused and reranked.",
  },
  {
    icon: MessagesSquare,
    step: "03",
    title: "Chat",
    body: "Ask in plain language. Answers stream back with citations to the exact source, page and section.",
  },
];

interface ProviderLogo {
  value: string;
  label: string;
  logo_url: string | null;
}

const FALLBACK_PROVIDERS = [
  "OpenAI", "Anthropic", "Gemini", "DeepSeek", "Groq", "Mistral",
  "xAI", "Qwen", "Zhipu", "MiniMax", "Meta", "Cohere",
  "Perplexity", "Together", "OpenRouter", "Fireworks",
];

export default function Workflow() {
  const [providers, setProviders] = useState<ProviderLogo[] | null>(null);
  const [broken, setBroken] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    api<{ data: ProviderLogo[] }>("/auth/providers/", {})
      .then((res) => {
        if (!cancelled && Array.isArray(res.data)) {
          setProviders(res.data.filter((p) => p.logo_url));
        }
      })
      .catch(() => {
        if (!cancelled) setProviders([]);
      });
    return () => { cancelled = true; };
  }, []);

  function markBroken(value: string) {
    setBroken((prev) => {
      const next = new Set(prev);
      next.add(value);
      return next;
    });
  }

  const showLogos = providers !== null && providers.length > 0;

  return (
    <>
      <section id="how" className="relative bg-[#081310] py-20 md:py-28 scroll-mt-20 border-y border-white/5">
        <div className="mx-auto max-w-[1120px] px-5">
          <p className="text-[12px] font-semibold tracking-[0.2em] text-[#D4F53C] uppercase mb-3">
            How it works
          </p>
          <h2 className="text-[30px] md:text-[40px] font-semibold tracking-tight text-[#F2FFEE] mb-12">
            From files to answers in three steps
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {steps.map(({ icon: Icon, step, title, body }) => (
              <div
                key={step}
                className="relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 overflow-hidden"
              >
                <span className="absolute -top-2 right-4 text-[64px] font-bold text-white/[0.05] select-none">
                  {step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#D4F53C] text-[#060F0C] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#F2FFEE] mb-2">{title}</h3>
                <p className="text-[13px] leading-relaxed text-[#9FCEBE]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="providers" className="relative bg-[#060F0C] py-16 md:py-20 scroll-mt-20 overflow-hidden">
        <div className="mx-auto max-w-[1120px] px-5 text-center mb-10">
          <p className="text-[12px] font-semibold tracking-[0.2em] text-[#D4F53C] uppercase mb-3">
            Providers
          </p>
          <h2 className="text-[26px] md:text-[32px] font-semibold tracking-tight text-[#F2FFEE] mb-3">
            Bring your own keys
          </h2>
          <p className="text-[14px] text-[#9FCEBE] max-w-[480px] mx-auto">
            Connect API keys from 23+ providers and switch models per chat — including free tiers.
          </p>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#060F0C] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#060F0C] to-transparent z-10" />
          <div className="flex w-max animate-marquee gap-3 px-3">
            {showLogos
              ? [...providers!, ...providers!].map((p, i) => (
                  <span
                    key={`${p.value}-${i}`}
                    className="shrink-0 inline-flex items-center gap-2.5 pl-1.5 pr-5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md text-[13px] font-medium text-[#F2FFEE]/80"
                  >
                    {!broken.has(p.value) && p.logo_url ? (
                      <img
                        src={p.logo_url}
                        alt={`${p.label} logo`}
                        loading="lazy"
                        onError={() => markBroken(p.value)}
                        className="w-7 h-7 rounded-full object-cover bg-white shrink-0"
                      />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-[#F2FFEE] shrink-0">
                        {p.label[0]}
                      </span>
                    )}
                    {p.label}
                  </span>
                ))
              : FALLBACK_PROVIDERS.concat(FALLBACK_PROVIDERS).map((p, i) => (
                  <span
                    key={`${p}-${i}`}
                    className="shrink-0 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md text-[13px] font-medium text-[#F2FFEE]/80"
                  >
                    {p}
                  </span>
                ))}
          </div>
        </div>
      </section>
    </>
  );
}
