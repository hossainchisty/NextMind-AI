"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, FileText } from "lucide-react";
import SitePage from "@/components/landing/SitePage";

const subprocessors = [
  { name: "Neon", purpose: "Managed PostgreSQL + pgvector for accounts, documents, and index metadata.", region: "ap-southeast-1" },
  { name: "Cloudflare R2", purpose: "Private object storage for uploaded files and logos.", region: "Auto (jurisdiction-pinned on request)" },
  { name: "Redis Cloud", purpose: "Task queue for document processing jobs (IDs only, no file contents).", region: "us-east-1" },
  { name: "Your AI providers", purpose: "Chat generation only — the providers whose keys you connect.", region: "Per provider" },
];

const documents = [
  { title: "Security overview", body: "Controls live in production: encryption, access scoping, and deletion.", href: "/security" },
  { title: "Privacy policy", body: "What we collect, why, and how long we keep it.", href: "/privacy" },
  { title: "GDPR compliance", body: "Rights, lawful bases, transfers, and how to exercise your rights.", href: "/gdpr" },
  { title: "Terms of service", body: "The rules of the road, in plain language.", href: "/terms" },
  { title: "System status", body: "Live health of database, queue, and storage, refreshed every 30 seconds.", href: "/status" },
];

export default function TrustPage() {
  return (
    <SitePage>
      <section className="pt-36 pb-10">
        <div className="mx-auto max-w-[1120px] px-5">
          <p className="text-[12px] font-semibold tracking-[0.2em] text-[#2A7D5F] uppercase mb-3">
            Trust Center
          </p>
          <h1 className="text-[36px] md:text-[48px] font-semibold tracking-tight text-[#0D2B22] mb-4 max-w-[640px]">
            Security and privacy, documented
          </h1>
          <p className="text-[16px] text-[#0D2B22]/65 max-w-[560px] mb-8">
            Everything a security review asks for — controls, subprocessors, documents, and contacts — in one place.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl pl-1.5 pr-5 py-1.5">
              <img
                src="/badges/iso-27001-certified.png"
                alt="ISO/IEC 27001 Certified badge"
                className="w-10 h-10 rounded-full object-cover bg-white ring-1 ring-black/10"
              />
              <span className="text-[13px] font-semibold text-[#0D2B22]">ISO/IEC 27001 Certified</span>
            </div>
            <Link
              href="/gdpr"
              className="inline-flex items-center gap-3 rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl pl-1.5 pr-5 py-1.5 hover:border-[#2A7D5F]/40 transition-colors"
            >
              <img
                src="/badges/gdpr-badge.jpg"
                alt="GDPR emblem"
                className="w-10 h-10 rounded-full object-cover bg-white ring-1 ring-black/10"
              />
              <span className="text-[13px] font-semibold text-[#0D2B22]">GDPR Ready</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="mx-auto max-w-[1120px] px-5">
          <h2 className="text-[22px] font-semibold tracking-tight text-[#0D2B22] mb-2">
            SOC 2 audit readiness
          </h2>
          <p className="text-[14px] text-[#0D2B22]/65 mb-6 max-w-[600px]">
            We are working toward a SOC 2 Type II examination. Below is the live
            status of each control area — updated as work ships. No certification
            is claimed until an independent auditor issues its report.
          </p>
          <div className="rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl overflow-hidden">
            {[
              { area: "Logical access (CC6.1)", status: "Implemented", note: "Owner-scoped data access, rotating short-lived sessions, login throttling, server-side logout." },
              { area: "Credentials (CC6.2)", status: "Implemented", note: "Salted password hashing, encrypted provider keys, masked display. MFA planned." },
              { area: "Encryption (CC6.3)", status: "Implemented", note: "Encrypted secrets, TLS database, expiring file links, hardened production config." },
              { area: "Boundaries (CC6.6)", status: "Implemented", note: "Private storage, local indexing pipeline, minimal third-party data flow." },
              { area: "Monitoring (CC7.2)", status: "Implemented", note: "Security events logged without PII; live public status page." },
              { area: "Change control (CC8.1)", status: "In progress", note: "Versioned migrations in place; gated CI pipeline being added." },
              { area: "Risk & vendors (CC3/CC9)", status: "In progress", note: "Subprocessor list published; formal risk assessment and DPAs underway." },
              { area: "Incident response (CC7.3–7.5)", status: "Planned", note: "Documented runbook and backup-restore verification scheduled next." },
            ].map((row, i, arr) => (
              <div
                key={row.area}
                className={`grid sm:grid-cols-[220px_130px_1fr] gap-1 sm:gap-4 px-6 py-5 items-start ${i < arr.length - 1 ? "border-b border-[#0D2B22]/10" : ""}`}
              >
                <span className="text-[14px] font-semibold text-[#0D2B22]">{row.area}</span>
                <span
                  className={`inline-flex w-fit items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                    row.status === "Implemented"
                      ? "bg-[#2A7D5F]/10 text-[#2A7D5F]"
                      : row.status === "In progress"
                        ? "bg-amber-500/10 text-amber-700"
                        : "bg-[#0D2B22]/5 text-[#0D2B22]/60"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    row.status === "Implemented" ? "bg-[#2A7D5F]" : row.status === "In progress" ? "bg-amber-500" : "bg-[#0D2B22]/40"
                  }`} />
                  {row.status}
                </span>
                <span className="text-[13px] leading-relaxed text-[#0D2B22]/65">{row.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="mx-auto max-w-[1120px] px-5">
          <h2 className="text-[22px] font-semibold tracking-tight text-[#0D2B22] mb-2">
            Subprocessors
          </h2>
          <p className="text-[14px] text-[#0D2B22]/65 mb-6 max-w-[600px]">
            The only third parties that touch customer data, what each one does, and where it runs.
          </p>
          <div className="rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl overflow-hidden">
            {subprocessors.map((s, i, arr) => (
              <div
                key={s.name}
                className={`grid sm:grid-cols-[200px_1fr_220px] gap-1 sm:gap-4 px-6 py-5 ${i < arr.length - 1 ? "border-b border-[#0D2B22]/10" : ""}`}
              >
                <span className="text-[14px] font-semibold text-[#0D2B22]">{s.name}</span>
                <span className="text-[13px] leading-relaxed text-[#0D2B22]/65">{s.purpose}</span>
                <span className="text-[12px] text-[#0D2B22]/50 font-mono">{s.region}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="mx-auto max-w-[1120px] px-5">
          <h2 className="text-[22px] font-semibold tracking-tight text-[#0D2B22] mb-6">
            Documents &amp; live evidence
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((d) => (
              <Link
                key={d.title}
                href={d.href}
                className="group rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl p-6 hover:border-[#2A7D5F]/40 hover:-translate-y-1 transition-all duration-300"
              >
                <FileText className="w-5 h-5 text-[#2A7D5F] mb-3" />
                <h3 className="text-[15px] font-semibold text-[#0D2B22] mb-1.5 flex items-center gap-1.5">
                  {d.title}
                  <ArrowUpRight className="w-4 h-4 text-[#0D2B22]/30 group-hover:text-[#2A7D5F] transition-colors" />
                </h3>
                <p className="text-[13px] text-[#0D2B22]/60">{d.body}</p>
              </Link>
            ))}
            <div className="rounded-2xl bg-[#0D2B22] p-6 flex flex-col justify-center">
              <h3 className="text-[15px] font-semibold text-[#F2FFEE] mb-1.5">
                Need a DPA or questionnaire?
              </h3>
              <p className="text-[13px] text-[#9FCEBE] mb-4">
                We respond to vendor reviews within five business days.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#D4F53C]"
              >
                Contact us <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
