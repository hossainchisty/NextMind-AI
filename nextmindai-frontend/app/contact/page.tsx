"use client";

import { useState } from "react";
import { Mail, MessageSquare, Activity, Send, Check } from "lucide-react";
import SitePage from "@/components/landing/SitePage";

const cards = [
  {
    icon: Mail,
    title: "Email us",
    body: "support@nextmind.ai — we reply within one business day.",
  },
  {
    icon: MessageSquare,
    title: "Product questions",
    body: "Ask about providers, file types, collections, or billing.",
  },
  {
    icon: Activity,
    title: "Status",
    body: "All systems operational. Incidents are posted on our status page.",
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSent(true);
  }

  const inputCls =
    "w-full px-4 py-3 rounded-xl bg-white border border-[#0D2B22]/15 text-[13px] text-[#0D2B22] placeholder:text-[#0D2B22]/40 focus:outline-none focus:border-[#2A7D5F]/60 focus:ring-2 focus:ring-[#2A7D5F]/10 transition-all";

  return (
    <SitePage>
      <section className="pt-36 pb-12">
        <div className="mx-auto max-w-[1120px] px-5">
          <p className="text-[12px] font-semibold tracking-[0.2em] text-[#2A7D5F] uppercase mb-3">
            Contact
          </p>
          <h1 className="text-[36px] md:text-[48px] font-semibold tracking-tight text-[#0D2B22] mb-4">
            Talk to a human
          </h1>
          <p className="text-[16px] text-[#0D2B22]/65 max-w-[520px]">
            Questions, feedback, or enterprise needs — send a message and we&apos;ll get back to you.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-[1120px] px-5 grid md:grid-cols-[1fr_1.2fr] gap-6 items-start">
          <div className="space-y-3">
            {cards.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl p-5 flex gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0D2B22] text-[#D4F53C] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#0D2B22] mb-1">{title}</h3>
                  <p className="text-[13px] text-[#0D2B22]/65">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl p-6 md:p-8">
            {sent ? (
              <div className="py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-[#2A7D5F]/10 text-[#2A7D5F] flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6" />
                </div>
                <h2 className="text-[18px] font-semibold text-[#0D2B22] mb-2">Message sent</h2>
                <p className="text-[13px] text-[#0D2B22]/65">
                  Thanks {name.split(" ")[0] || "there"} — we&apos;ll reply to {email} shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[#0D2B22] mb-1.5">Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Ada Lovelace"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[#0D2B22] mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#0D2B22] mb-1.5">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    placeholder="How can we help?"
                    className={`${inputCls} resize-none`}
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#0D2B22] text-[#F2FFEE] text-[14px] font-semibold hover:bg-[#1A4435] transition-colors"
                >
                  <Send className="w-4 h-4" /> Send message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </SitePage>
  );
}
