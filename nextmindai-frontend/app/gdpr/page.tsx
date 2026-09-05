"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SitePage from "@/components/landing/SitePage";

const rights = [
  {
    title: "Right of access",
    body: "Confirm whether we process your data and get a copy of it. Your workspace already shows your documents, collections, and conversations; contact us for anything else.",
  },
  {
    title: "Rectification",
    body: "Fix inaccurate profile data directly in account settings, or ask us to correct anything you can't change yourself.",
  },
  {
    title: "Erasure",
    body: "Delete individual documents or collections any time — files, chunks, and embeddings are removed. Deleting your account removes everything within 30 days.",
  },
  {
    title: "Data portability",
    body: "Export your data from the workspace and receive it in a commonly used, machine-readable format on request.",
  },
  {
    title: "Restriction & objection",
    body: "Ask us to restrict processing or object to it where the law gives you that right. We will assess every request individually.",
  },
  {
    title: "Withdraw consent",
    body: "Where processing relies on your consent (for example, the newsletter), withdraw it at any time — unsubscribing is one click.",
  },
];

const sections: { title: string; paragraphs: string[] }[] = [
  {
    title: "Our role",
    paragraphs: [
      "For your account data, NextMind acts as the data controller: we decide how and why it is processed to run the service. For the documents you upload, you are the controller and we process them as your processor — only to parse, index, retrieve, and answer over them on your instructions.",
    ],
  },
  {
    title: "Lawful bases",
    paragraphs: [
      "Contract: operating your workspace, indexing your files, and routing chats to your connected providers.",
      "Legitimate interests: keeping the service secure, preventing abuse, and maintaining reliability.",
      "Consent: sending the newsletter and any optional communications — withdrawable at any time.",
      "Legal obligation: retaining narrow records where the law requires it.",
    ],
  },
  {
    title: "International transfers",
    paragraphs: [
      "Storage and AI providers may operate outside the EEA/UK. Where transfers occur, we rely on appropriate safeguards such as adequacy decisions or standard contractual clauses, including those offered by our infrastructure and model providers.",
    ],
  },
  {
    title: "Retention",
    paragraphs: [
      "Workspace content lives as long as your account does and is deleted with it (within 30 days). Backups, if any, roll off on their normal cycle. Anything you delete in the app is removed from live systems immediately.",
    ],
  },
  {
    title: "How to exercise your rights",
    paragraphs: [
      "Use the in-app controls first: account settings for your profile, the knowledge and collections pages for your content, and provider settings for your keys.",
      "For anything else — including access, portability, or erasure requests — email support@nextmind.ai. We verify identity to protect your data and respond within one month as the GDPR requires.",
    ],
  },
];

export default function GdprPage() {
  return (
    <SitePage>
      <section className="pt-36 pb-10">
        <div className="mx-auto max-w-[760px] px-5">
          <p className="text-[12px] font-semibold tracking-[0.2em] text-[#2A7D5F] uppercase mb-3">
            GDPR compliance
          </p>
          <h1 className="text-[36px] md:text-[44px] font-semibold tracking-tight text-[#0D2B22] mb-3">
            Your rights, honored in the product
          </h1>
          <p className="text-[13px] text-[#0D2B22]/55">Last updated: September 2026</p>
        </div>
      </section>

      <section className="pb-10">
        <div className="mx-auto max-w-[760px] px-5">
          <h2 className="text-[22px] font-semibold tracking-tight text-[#0D2B22] mb-4">
            Data subject rights
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {rights.map((r) => (
              <div
                key={r.title}
                className="rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl p-6"
              >
                <h3 className="text-[15px] font-semibold text-[#0D2B22] mb-2">{r.title}</h3>
                <p className="text-[13px] leading-relaxed text-[#0D2B22]/65">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-[760px] px-5 space-y-8">
          {sections.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl p-6 md:p-8"
            >
              <h2 className="text-[18px] font-semibold text-[#0D2B22] mb-3">{s.title}</h2>
              <div className="space-y-3">
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="text-[14px] leading-relaxed text-[#0D2B22]/70">{p}</p>
                ))}
              </div>
            </div>
          ))}
          <div className="rounded-3xl bg-[#0D2B22] px-8 py-10 text-center">
            <h2 className="text-[22px] font-semibold tracking-tight text-[#F2FFEE] mb-2">
              Questions about your data?
            </h2>
            <p className="text-[13px] text-[#9FCEBE] mb-5">
              Read the full policy or talk to us directly.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#D4F53C] text-[#060F0C] text-[14px] font-semibold hover:bg-[#E0FF52] transition-colors"
              >
                Privacy policy <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl border border-white/20 text-[14px] font-medium text-[#F2FFEE] hover:bg-white/10 transition-colors"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
