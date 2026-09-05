"use client";

import { Scale, HardHat, Microscope, Headset } from "lucide-react";

const cases = [
  {
    icon: Scale,
    title: "Legal teams",
    body: "Review contracts and policies against the exact clause. Every answer cites the document and page for verification.",
    example: "“What is the termination notice in the MSA?”",
  },
  {
    icon: HardHat,
    title: "Engineering",
    body: "Turn runbooks, specs, and incident history into an on-call assistant that points at the right page.",
    example: "“How do we roll back the billing service?”",
  },
  {
    icon: Microscope,
    title: "Research",
    body: "Question papers, reports, and datasets together — with sources attached to every claim.",
    example: "“Which studies support this dosage?”",
  },
  {
    icon: Headset,
    title: "Support",
    body: "Answer customers from your own help center and manuals instead of memory.",
    example: "“Where do I reset SSO settings?”",
  },
];

export default function UseCases() {
  return (
    <section id="usecases" className="relative bg-[#F2FFEE] py-20 md:py-28 scroll-mt-20 border-t border-[#0D2B22]/10">
      <div className="mx-auto max-w-[1120px] px-5">
        <p className="text-[12px] font-semibold tracking-[0.2em] text-[#2A7D5F] uppercase mb-3">
          Use cases
        </p>
        <h2 className="text-[30px] md:text-[40px] font-semibold tracking-tight text-[#0D2B22] mb-3 max-w-[560px]">
          One workspace, every kind of question
        </h2>
        <p className="text-[15px] text-[#0D2B22]/65 mb-12 max-w-[520px]">
          Scope a collection to the domain, then ask in plain language.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cases.map(({ icon: Icon, title, body, example }) => (
            <div
              key={title}
              className="rounded-2xl bg-[#0D2B22] p-6 flex flex-col hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(13,43,34,0.3)] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D4F53C] text-[#060F0C] flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-[16px] font-semibold text-[#F2FFEE] mb-2">{title}</h3>
              <p className="text-[13px] leading-relaxed text-[#9FCEBE] flex-1">{body}</p>
              <p className="text-[12px] italic text-[#D4F53C]/90 mt-4 pt-4 border-t border-white/10">
                {example}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
