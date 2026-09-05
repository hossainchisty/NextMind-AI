"use client";

import { Linkedin, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import SitePage from "@/components/landing/SitePage";

// TODO: replace with Hossain's real LinkedIn profile URL.
const FOUNDER_LINKEDIN_URL = "https://www.linkedin.com/";

export default function LeadershipPage() {
  return (
    <SitePage>
      <section className="pt-36 pb-12">
        <div className="mx-auto max-w-[1120px] px-5">
          <p className="text-[12px] font-semibold tracking-[0.2em] text-[#2A7D5F] uppercase mb-3">
            Leadership
          </p>
          <h1 className="text-[36px] md:text-[48px] font-semibold tracking-tight text-[#0D2B22] mb-4">
            The people behind NextMind
          </h1>
          <p className="text-[16px] text-[#0D2B22]/65 max-w-[520px]">
            A small team obsessed with private, trustworthy AI for your documents.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-[1120px] px-5">
          <div className="grid md:grid-cols-[320px_1fr] gap-6 items-stretch">
            {/* Photo placeholder — founder image goes here */}
            <div className="rounded-3xl border-2 border-dashed border-[#0D2B22]/20 bg-white/50 backdrop-blur-xl min-h-[380px] flex flex-col items-center justify-center gap-3 p-8 text-center">
              <span className="w-24 h-24 rounded-full bg-[#0D2B22] text-[#D4F53C] flex items-center justify-center text-[32px] font-bold">
                HC
              </span>
              <p className="text-[13px] font-medium text-[#0D2B22]">Founder photo</p>
              <p className="text-[12px] text-[#0D2B22]/55">Coming soon</p>
            </div>

            {/* Founder card */}
            <div className="rounded-3xl bg-[#0D2B22] p-8 md:p-12 relative overflow-hidden flex flex-col justify-center">
              <div className="pointer-events-none absolute -top-24 right-10 w-80 h-80 rounded-full bg-[#D4F53C]/15 blur-[80px]" />
              <div className="relative">
                <p className="text-[12px] font-semibold tracking-[0.2em] text-[#D4F53C] uppercase mb-3">
                  Founder
                </p>
                <h2 className="text-[30px] md:text-[40px] font-semibold tracking-tight text-[#F2FFEE] mb-4">
                  Hossain Chisty
                </h2>
                <p className="text-[15px] leading-relaxed text-[#9FCEBE] mb-4 max-w-[520px]">
                  Hossain founded NextMind on a simple belief: teams should be able to
                  talk to their documents without handing their data to someone
                  else&apos;s model. He leads product and engineering, with a focus on
                  retrieval quality, privacy architecture, and craft.
                </p>
                <p className="text-[15px] leading-relaxed text-[#9FCEBE] mb-8 max-w-[520px]">
                  Before NextMind, he built data-intensive products and grew convinced
                  that cited, private AI beats confident, leaky AI — every time.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={FOUNDER_LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#D4F53C] text-[#060F0C] text-[14px] font-semibold hover:bg-[#E0FF52] transition-colors"
                  >
                    <Linkedin className="w-4 h-4" /> Connect on LinkedIn
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-white/20 text-[14px] font-medium text-[#F2FFEE] hover:bg-white/10 transition-colors"
                  >
                    <Mail className="w-4 h-4" /> Get in touch <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            {[
              { title: "Privacy first", body: "Your files and keys are yours. Architecture before promises." },
              { title: "Cite, don't hallucinate", body: "Every answer traces back to the exact source." },
              { title: "No lock-in", body: "Your models, your keys, your data — always portable." },
            ].map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl p-6"
              >
                <h3 className="text-[15px] font-semibold text-[#0D2B22] mb-2">{v.title}</h3>
                <p className="text-[13px] leading-relaxed text-[#0D2B22]/65">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SitePage>
  );
}
