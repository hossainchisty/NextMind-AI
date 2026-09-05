"use client";

import Link from "next/link";
import { ArrowRight, Lock, KeyRound, UserCheck, Link2Off, Cpu, EyeOff, FileDown, Trash2, Bug } from "lucide-react";
import SitePage from "@/components/landing/SitePage";

const controls = [
  {
    icon: KeyRound,
    title: "Provider keys encrypted at rest",
    body: "API keys are Fernet-encrypted in the database and decrypted only in memory at call time. List endpoints return masked values — full keys are never readable after you save them.",
  },
  {
    icon: Lock,
    title: "Hashed passwords, short-lived tokens",
    body: "Passwords are salted-hashed with strength validation. Sessions use 30-minute access tokens with rotation — stolen tokens expire fast.",
  },
  {
    icon: UserCheck,
    title: "Strictly scoped access",
    body: "Every document, collection, conversation, and key is filtered to its owner on every request. Users can only ever see their own data.",
  },
  {
    icon: Link2Off,
    title: "Expiring file links",
    body: "Stored files are private and served through signed URLs that expire within hours — never permanent public links.",
  },
  {
    icon: Cpu,
    title: "Local indexing pipeline",
    body: "Parsing, embeddings, and reranking run on our own infrastructure. Only the final query plus retrieved passages go to the AI provider you chose.",
  },
  {
    icon: EyeOff,
    title: "No training on your data",
    body: "Your documents and conversations are never used to train models. Bring-your-own keys mean usage stays on your provider accounts.",
  },
  {
    icon: FileDown,
    title: "Self-serve export",
    body: "Download your profile, collections, documents, conversations, and connected providers as JSON any time from Settings.",
  },
  {
    icon: Trash2,
    title: "Real deletion",
    body: "Deleting a document purges its file, chunks, and embeddings. Deleting your account queues a full purge of every file and row.",
  },
];

export default function SecurityPage() {
  return (
    <SitePage>
      <section className="pt-36 pb-12">
        <div className="mx-auto max-w-[1120px] px-5">
          <p className="text-[12px] font-semibold tracking-[0.2em] text-[#2A7D5F] uppercase mb-3">
            Security
          </p>
          <h1 className="text-[36px] md:text-[48px] font-semibold tracking-tight text-[#0D2B22] mb-4 max-w-[640px]">
            Built like your data matters
          </h1>
          <p className="text-[16px] leading-relaxed text-[#0D2B22]/65 max-w-[560px]">
            What we do to protect your files, keys, and account — in concrete terms,
            not marketing terms.
          </p>
          <div className="flex items-center gap-4 mt-6 rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl px-5 py-4 max-w-[560px]">
            <img
              src="/iso-27001-certified.png"
              alt="ISO/IEC 27001 Certified badge"
              className="w-14 h-14 rounded-full object-cover ring-1 ring-black/10 shrink-0"
            />
            <div>
              <p className="text-[14px] font-semibold text-[#0D2B22]">
                ISO/IEC 27001 Certified
              </p>
              <p className="text-[12px] text-[#0D2B22]/60">
                Information security management, independently certified.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-[1120px] px-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {controls.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0D2B22] text-[#D4F53C] flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#0D2B22] mb-2">{title}</h3>
              <p className="text-[13px] leading-relaxed text-[#0D2B22]/65">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-[1120px] px-5 grid md:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-[#0D2B22] px-8 py-10 relative overflow-hidden">
            <div className="pointer-events-none absolute -top-20 right-0 w-64 h-64 rounded-full bg-[#D4F53C]/10 blur-[70px]" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-[#D4F53C] text-[#060F0C] flex items-center justify-center mb-4">
                <Bug className="w-5 h-5" />
              </div>
              <h2 className="text-[20px] font-semibold text-[#F2FFEE] mb-2">
                Found a vulnerability?
              </h2>
              <p className="text-[13px] leading-relaxed text-[#9FCEBE] mb-5">
                Email support@nextmind.ai with details and steps to reproduce.
                We investigate every report and credit researchers who help us improve.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#D4F53C] text-[#060F0C] text-[13px] font-semibold hover:bg-[#E0FF52] transition-colors"
              >
                Report an issue <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl px-8 py-10">
            <h2 className="text-[20px] font-semibold text-[#0D2B22] mb-2">
              Compliance, minus the hand-waving
            </h2>
            <p className="text-[13px] leading-relaxed text-[#0D2B22]/65 mb-5">
              Our GDPR program documents controller roles, lawful bases, retention,
              and your rights — with self-serve export and deletion to back it up.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/gdpr"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#0D2B22] text-[#F2FFEE] text-[13px] font-semibold hover:bg-[#1A4435] transition-colors"
              >
                GDPR compliance <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-[#0D2B22]/15 text-[13px] font-medium text-[#0D2B22] hover:bg-white transition-colors"
              >
                Privacy policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
