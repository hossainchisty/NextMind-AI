"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BookOpen, ArrowUpRight } from "lucide-react";
import SitePage from "@/components/landing/SitePage";
import { docs, docCategories } from "@/components/landing/docs";

export default function DocsPage() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  return (
    <SitePage>
      <section className="pt-36 pb-10">
        <div className="mx-auto max-w-[1120px] px-5">
          <p className="text-[12px] font-semibold tracking-[0.2em] text-[#2A7D5F] uppercase mb-3">
            Documentation
          </p>
          <h1 className="text-[36px] md:text-[48px] font-semibold tracking-tight text-[#0D2B22] mb-4">
            How NextMind works
          </h1>
          <div className="relative max-w-[480px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0D2B22]/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search guides..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#0D2B22]/15 text-[13px] text-[#0D2B22] placeholder:text-[#0D2B22]/40 focus:outline-none focus:border-[#2A7D5F]/60 transition-all"
            />
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-[1120px] px-5 space-y-10">
          {docCategories.map((cat) => {
            const articles = docs.filter(
              (d) => d.category === cat && (!q || `${d.title} ${d.excerpt}`.toLowerCase().includes(q))
            );
            if (!articles.length) return null;
            return (
              <div key={cat}>
                <h2 className="text-[18px] font-semibold text-[#0D2B22] mb-4">{cat}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {articles.map((a) => (
                    <Link
                      key={a.slug}
                      href={`/docs/${a.slug}`}
                      className="group rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl p-6 hover:border-[#2A7D5F]/40 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(13,43,34,0.12)] transition-all duration-300"
                    >
                      <BookOpen className="w-5 h-5 text-[#2A7D5F] mb-3" />
                      <h3 className="text-[15px] font-semibold text-[#0D2B22] mb-1.5 group-hover:text-[#2A7D5F] transition-colors">
                        {a.title}
                      </h3>
                      <p className="text-[13px] text-[#0D2B22]/60 line-clamp-2">{a.excerpt}</p>
                      <ArrowUpRight className="w-4 h-4 mt-3 text-[#0D2B22]/30 group-hover:text-[#2A7D5F] transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
          {q && !docs.some((d) => `${d.title} ${d.excerpt}`.toLowerCase().includes(q)) && (
            <p className="text-[14px] text-[#0D2B22]/60">
              No guides match &ldquo;{query}&rdquo;. Try the <Link href="/blog" className="text-[#2A7D5F] font-medium">blog</Link> or <Link href="/contact" className="text-[#2A7D5F] font-medium">contact us</Link>.
            </p>
          )}
        </div>
      </section>
    </SitePage>
  );
}
