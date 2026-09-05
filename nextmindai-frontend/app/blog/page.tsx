"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import SitePage from "@/components/landing/SitePage";
import { posts } from "@/components/landing/posts";

export default function BlogPage() {
  const [featured, ...rest] = posts;

  return (
    <SitePage>
      <section className="pt-36 pb-10">
        <div className="mx-auto max-w-[1120px] px-5">
          <p className="text-[12px] font-semibold tracking-[0.2em] text-[#2A7D5F] uppercase mb-3">
            Blog
          </p>
          <h1 className="text-[36px] md:text-[48px] font-semibold tracking-tight text-[#0D2B22] mb-4">
            Notes on retrieval &amp; the product
          </h1>
          <p className="text-[16px] text-[#0D2B22]/65 max-w-[520px]">
            How our search pipeline works, how to organize knowledge, and what&apos;s new.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-[1120px] px-5">
          <Link
            href={`/blog/${featured.slug}`}
            className="group block rounded-3xl bg-[#0D2B22] p-8 md:p-12 mb-6 overflow-hidden relative"
          >
            <div className="pointer-events-none absolute -top-24 right-10 w-80 h-80 rounded-full bg-[#D4F53C]/15 blur-[80px]" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#D4F53C] text-[#060F0C]">
                  {featured.tag}
                </span>
                <span className="text-[12px] text-[#9FCEBE]">
                  {featured.date} · {featured.readTime}
                </span>
              </div>
              <h2 className="text-[24px] md:text-[32px] font-semibold tracking-tight text-[#F2FFEE] mb-3 max-w-[640px] group-hover:text-[#D4F53C] transition-colors">
                {featured.title}
              </h2>
              <p className="text-[14px] leading-relaxed text-[#9FCEBE] max-w-[600px] mb-5">
                {featured.excerpt}
              </p>
              <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#D4F53C]">
                Read article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl p-6 hover:border-[#2A7D5F]/40 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(13,43,34,0.12)] transition-all duration-300 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#0D2B22]/5 text-[#0D2B22]">
                    {post.tag}
                  </span>
                  <span className="text-[11px] text-[#0D2B22]/50">{post.readTime}</span>
                </div>
                <h3 className="text-[16px] font-semibold text-[#0D2B22] mb-2 group-hover:text-[#2A7D5F] transition-colors">
                  {post.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-[#0D2B22]/60 line-clamp-3 flex-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[12px] text-[#0D2B22]/50">{post.date}</span>
                  <ArrowUpRight className="w-4 h-4 text-[#0D2B22]/40 group-hover:text-[#2A7D5F] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SitePage>
  );
}
