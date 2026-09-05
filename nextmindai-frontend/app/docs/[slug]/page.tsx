import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import SitePage from "@/components/landing/SitePage";
import { docs, docCategories } from "@/components/landing/docs";

export function generateStaticParams() {
  return docs.map((d) => ({ slug: d.slug }));
}

export default function DocArticlePage({ params }: { params: { slug: string } }) {
  const index = docs.findIndex((d) => d.slug === params.slug);
  if (index === -1) notFound();
  const article = docs[index];
  const next = docs[(index + 1) % docs.length];

  return (
    <SitePage>
      <article className="pt-36 pb-16">
        <div className="mx-auto max-w-[1120px] px-5 grid lg:grid-cols-[240px_1fr] gap-10 items-start">
          <aside className="hidden lg:block sticky top-28 max-h-[70vh] overflow-y-auto rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl p-4">
            {docCategories.map((cat) => (
              <div key={cat} className="mb-4 last:mb-0">
                <p className="px-2 mb-1 text-[10px] font-semibold tracking-wider text-[#0D2B22]/50 uppercase">
                  {cat}
                </p>
                {docs
                  .filter((d) => d.category === cat)
                  .map((d) => (
                    <Link
                      key={d.slug}
                      href={`/docs/${d.slug}`}
                      className={`block px-2 py-1.5 rounded-lg text-[13px] transition-colors ${
                        d.slug === article.slug
                          ? "bg-[#0D2B22]/5 text-[#0D2B22] font-medium"
                          : "text-[#0D2B22]/60 hover:bg-white hover:text-[#0D2B22]"
                      }`}
                    >
                      {d.title}
                    </Link>
                  ))}
              </div>
            ))}
          </aside>

          <div className="max-w-[680px]">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 text-[13px] text-[#0D2B22]/60 hover:text-[#0D2B22] transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> All guides
            </Link>
            <p className="text-[12px] font-semibold tracking-[0.2em] text-[#2A7D5F] uppercase mb-3">
              {article.category}
            </p>
            <h1 className="text-[32px] md:text-[40px] font-semibold tracking-tight text-[#0D2B22] mb-4">
              {article.title}
            </h1>
            <p className="text-[15px] text-[#0D2B22]/60 mb-10">{article.excerpt}</p>
            <div className="space-y-8">
              {article.body.map((block, i) => (
                <div key={i}>
                  {block.heading && (
                    <h2 className="text-[20px] font-semibold tracking-tight text-[#0D2B22] mb-3">
                      {block.heading}
                    </h2>
                  )}
                  <div className="space-y-4">
                    {block.paragraphs.map((p, j) => (
                      <p key={j} className="text-[15px] leading-[1.8] text-[#0D2B22]/75">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Link
              href={`/docs/${next.slug}`}
              className="group flex items-center justify-between gap-4 mt-14 rounded-2xl bg-[#0D2B22] p-6 hover:bg-[#1A4435] transition-colors"
            >
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-[#9FCEBE] uppercase mb-1">
                  Next guide
                </p>
                <p className="text-[15px] font-semibold text-[#F2FFEE]">{next.title}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-[#D4F53C] shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </article>
    </SitePage>
  );
}
