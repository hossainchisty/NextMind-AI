"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Check } from "lucide-react";
import { BrainNodeIcon } from "@/components/ui/Icons";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.15c0 .3.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
  );
}

function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z"/></svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
  );
}

function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/></svg>
  );
}

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how" },
      { label: "Providers", href: "#providers" },
      { label: "Use cases", href: "/#usecases" },
      { label: "Knowledge base", href: "/knowledge" },
      { label: "Collections", href: "/collections" },
    ],
  },
  {
    title: "Workspace",
    links: [
      { label: "Open chat", href: "/chat" },
      { label: "Upload documents", href: "/knowledge" },
      { label: "Connect providers", href: "/settings/providers" },
      { label: "Account settings", href: "/settings/account" },
      { label: "Billing & plans", href: "/settings/account/billing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Supported file types", href: "#features" },
      { label: "Hybrid search guide", href: "#how" },
      { label: "Documentation", href: "/docs" },
      { label: "API reference", href: "/docs/api-reference" },
      { label: "Security", href: "/security" },
      { label: "Trust Center", href: "/trust" },
      { label: "Changelog", href: "/changelog" },
      { label: "Community", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Leadership", href: "/leadership" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "GDPR compliance", href: "/gdpr" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
];

const socials = [
  { icon: GithubIcon, label: "GitHub", href: "#" },
  { icon: XIcon, label: "X (Twitter)", href: "#" },
  { icon: LinkedinIcon, label: "LinkedIn", href: "#" },
  { icon: YoutubeIcon, label: "YouTube", href: "#" },
];

export default function MegaFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  }

  return (
    <footer className="relative bg-[#040907] border-t border-white/10 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[240px] rounded-full bg-[#D4F53C]/[0.06] blur-[100px]" />
      <div className="relative mx-auto max-w-[1120px] px-5 pt-16 pb-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr] mb-14">
          {/* Brand + newsletter */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <span className="w-9 h-9 rounded-[10px] bg-[#D4F53C] text-[#060F0C] flex items-center justify-center">
                <BrainNodeIcon className="w-5 h-5" />
              </span>
              <span className="text-[16px] font-semibold tracking-tight text-[#F2FFEE]">
                Next<span className="text-[#D4F53C]">Mind</span>
              </span>
            </Link>
            <p className="text-[13px] leading-relaxed text-[#9FCEBE] mb-6 max-w-[300px]">
              The private AI knowledge workspace. Upload your documents, connect any
              provider, and chat with citations.
            </p>
            <p className="text-[12px] font-semibold tracking-wider text-[#F2FFEE]/80 uppercase mb-3">
              Stay in the loop
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-[13px] text-[#D4F53C]">
                <Check className="w-4 h-4" /> You&apos;re subscribed. Welcome aboard.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-[300px]">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 min-w-0 h-10 px-3.5 rounded-xl border border-white/10 bg-white/5 text-[13px] text-[#F2FFEE] placeholder:text-[#9FCEBE]/40 focus:outline-none focus:border-[#D4F53C]/50 transition-colors"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="w-10 h-10 rounded-xl bg-[#D4F53C] text-[#060F0C] flex items-center justify-center hover:bg-[#E0FF52] transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
            <div className="flex items-center gap-2 mt-6">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-[#9FCEBE] hover:text-[#060F0C] hover:bg-[#D4F53C] hover:border-transparent transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-[12px] font-semibold tracking-wider text-[#F2FFEE]/80 uppercase mb-4">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith("#") ? (
                        <a
                          href={l.href}
                          className="text-[13px] text-[#9FCEBE] hover:text-[#D4F53C] transition-colors"
                        >
                          {l.label}
                        </a>
                      ) : (
                        <Link
                          href={l.href}
                          className="text-[13px] text-[#9FCEBE] hover:text-[#D4F53C] transition-colors"
                        >
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
          <p className="text-[12px] text-[#9FCEBE]/60">
            © 2026 NextMind. All rights reserved.
          </p>
          <Link href="/status" className="flex items-center gap-2 text-[12px] text-[#9FCEBE]/60 hover:text-[#F2FFEE] transition-colors">
            <span className="w-2 h-2 rounded-full bg-[#D4F53C] animate-pulse-dot" />
            All systems operational
          </Link>
          <div className="flex items-center gap-5 text-[12px]">
            <Link href="/privacy" className="text-[#9FCEBE]/60 hover:text-[#F2FFEE] transition-colors">Privacy</Link>
            <Link href="/terms" className="text-[#9FCEBE]/60 hover:text-[#F2FFEE] transition-colors">Terms</Link>
            <Link href="/security" className="text-[#9FCEBE]/60 hover:text-[#F2FFEE] transition-colors">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
