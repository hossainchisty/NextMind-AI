"use client";

import SitePage from "@/components/landing/SitePage";

type Tag = "New" | "Improved" | "Fixed";

interface Entry {
  version: string;
  date: string;
  items: { tag: Tag; text: string }[];
}

const tagStyles: Record<Tag, string> = {
  New: "bg-[#2A7D5F]/10 text-[#2A7D5F]",
  Improved: "bg-[#0D2B22]/5 text-[#0D2B22]",
  Fixed: "bg-amber-500/10 text-amber-700",
};

const entries: Entry[] = [
  {
    version: "v1.4.0",
    date: "September 2026",
    items: [
      { tag: "New", text: "Brand landing page with glass design, providers marquee, and mega footer." },
      { tag: "New", text: "Company pages: About, Blog, Contact, Privacy, Terms, and GDPR compliance." },
      { tag: "New", text: "Blog with guides on hybrid search, reranking, and collections." },
      { tag: "Improved", text: "Chat moved to /chat so the homepage can welcome new visitors." },
    ],
  },
  {
    version: "v1.3.0",
    date: "September 2026",
    items: [
      { tag: "New", text: "Dark mode across the entire app, with a working Appearance setting (Light / Dark / System)." },
      { tag: "Improved", text: "Brand color system: forest, lime, frost, and midnight with dedicated button tones." },
      { tag: "Improved", text: "Two-tone NextMind wordmark and theme-aware chat bubbles." },
    ],
  },
  {
    version: "v1.2.0",
    date: "September 2026",
    items: [
      { tag: "New", text: "Collections: full create, rename, delete, and detail views with document management." },
      { tag: "New", text: "Assign or remove documents from any collection, with instant search." },
      { tag: "New", text: "Knowledge page redesigned: stats, filters, sorting, and bulk actions." },
    ],
  },
  {
    version: "v1.1.0",
    date: "September 2026",
    items: [
      { tag: "New", text: "Eight supported file types: PDF, DOCX, TXT, CSV, MD, XLSX, JSON, HTML." },
      { tag: "New", text: "Batch uploads up to 40 files with a live progress bar and per-file errors." },
      { tag: "New", text: "Re-upload any document when its source file changes — chunks rebuild automatically." },
      { tag: "Improved", text: "Maximum file size raised to 100 MB per file." },
      { tag: "Fixed", text: "List endpoints now honor pagination; collection document search fixed." },
    ],
  },
  {
    version: "v1.0.0",
    date: "August 2026",
    items: [
      { tag: "New", text: "Private AI knowledge workspace: upload documents and chat with citations." },
      { tag: "New", text: "Hybrid retrieval — semantic embeddings plus BM25, fused and cross-encoder reranked." },
      { tag: "New", text: "Bring-your-own-key providers with per-chat model selection." },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <SitePage>
      <section className="pt-36 pb-10">
        <div className="mx-auto max-w-[760px] px-5">
          <p className="text-[12px] font-semibold tracking-[0.2em] text-[#2A7D5F] uppercase mb-3">
            Changelog
          </p>
          <h1 className="text-[36px] md:text-[44px] font-semibold tracking-tight text-[#0D2B22] mb-3">
            What&apos;s new
          </h1>
          <p className="text-[15px] text-[#0D2B22]/65">
            Every meaningful change to NextMind, newest first.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-[760px] px-5">
          <div className="relative pl-6 border-l-2 border-[#0D2B22]/10 space-y-10">
            {entries.map((entry) => (
              <div key={entry.version} className="relative">
                <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#D4F53C] ring-4 ring-[#F2FFEE]" />
                <div className="flex flex-wrap items-baseline gap-3 mb-4">
                  <h2 className="text-[20px] font-semibold text-[#0D2B22]">{entry.version}</h2>
                  <span className="text-[12px] text-[#0D2B22]/55">{entry.date}</span>
                </div>
                <div className="rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl p-6">
                  <ul className="space-y-3">
                    {entry.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${tagStyles[item.tag]}`}
                        >
                          {item.tag}
                        </span>
                        <span className="text-[14px] leading-relaxed text-[#0D2B22]/75">
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SitePage>
  );
}
