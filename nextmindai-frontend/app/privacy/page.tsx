"use client";

import SitePage from "@/components/landing/SitePage";

const sections: { id?: string; title: string; paragraphs: string[] }[] = [
  {
    title: "Overview",
    paragraphs: [
      "NextMind is a private AI knowledge workspace. This policy explains what data we collect, how we use it, and the choices you have. The short version: your documents and API keys are yours — we store them to operate the service and never sell them or use them to train models.",
    ],
  },
  {
    title: "Data we collect",
    paragraphs: [
      "Account data: your name, email address, and authentication credentials when you register and sign in.",
      "Content you provide: documents you upload, collections you create, conversations you hold, and settings you configure.",
      "Provider credentials: API keys you connect for third-party AI providers. These are stored so the app can call providers on your behalf.",
      "Operational data: basic logs needed for security, debugging, and billing (for example, request timestamps and error traces).",
    ],
  },
  {
    title: "How we use your data",
    paragraphs: [
      "To parse, chunk, embed, and index your documents so they can be searched and cited in chat.",
      "To route your chat requests to the AI providers you connected, using the keys you supplied.",
      "To maintain your account, enforce limits, prevent abuse, and improve reliability of the service.",
      "We do not use your documents or conversations to train machine-learning models.",
    ],
  },
  {
    title: "Storage",
    paragraphs: [
      "Uploaded files are stored in isolated private cloud object storage, scoped to your account. Document text is split into chunks with embeddings stored alongside them for retrieval.",
      "Deleting a document removes its file, its chunks, and its embeddings. Deleting your account removes all of your data.",
    ],
  },
  {
    title: "Third-party providers",
    paragraphs: [
      "When you chat, the relevant retrieved passages and your message are sent to the AI provider whose key you connected, subject to that provider's own terms and privacy policy. We recommend reviewing the policies of any provider you connect.",
      "Bring-your-own-key billing means usage charges come directly from your provider accounts, not from us.",
    ],
  },
  {
    id: "security",
    title: "Security",
    paragraphs: [
      "Accounts are protected with salted password hashing and short-lived signed access tokens. Files are stored in private buckets and served through expiring signed URLs.",
      "No system is perfectly secure, but we apply industry-standard practices — encryption in transit, least-privilege access, and scoped credentials — and we will notify affected users of any breach as required by law.",
    ],
  },
  {
    title: "Retention and deletion",
    paragraphs: [
      "Your data is kept while your account is active. You can delete individual documents or collections at any time from the workspace, which removes the underlying files and index entries.",
      "If you delete your account, we remove your documents, conversations, keys, and profile within 30 days, except where retention is required by law.",
    ],
  },
  {
    title: "Your rights",
    paragraphs: [
      "Depending on your jurisdiction, you may have the right to access, correct, export, or delete your personal data. Contact support@nextmind.ai and we will respond within 30 days.",
    ],
  },
  {
    title: "Changes to this policy",
    paragraphs: [
      "We may update this policy as the product evolves. Material changes will be announced in the app or by email, and the revision date below will be updated.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <SitePage>
      <section className="pt-36 pb-10">
        <div className="mx-auto max-w-[760px] px-5">
          <p className="text-[12px] font-semibold tracking-[0.2em] text-[#2A7D5F] uppercase mb-3">
            Privacy policy
          </p>
          <h1 className="text-[36px] md:text-[44px] font-semibold tracking-tight text-[#0D2B22] mb-3">
            Your data stays yours
          </h1>
          <p className="text-[13px] text-[#0D2B22]/55">Last updated: September 2026</p>
        </div>
      </section>
      <section className="pb-20">
        <div className="mx-auto max-w-[760px] px-5 space-y-8">
          {sections.map((s) => (
            <div
              key={s.title}
              id={s.id}
              className="rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl p-6 md:p-8 scroll-mt-28"
            >
              <h2 className="text-[18px] font-semibold text-[#0D2B22] mb-3">{s.title}</h2>
              <div className="space-y-3">
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="text-[14px] leading-relaxed text-[#0D2B22]/70">{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </SitePage>
  );
}
