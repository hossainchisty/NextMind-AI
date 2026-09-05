import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import SitePage from "@/components/landing/SitePage";
import { posts } from "@/components/landing/posts";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const index = posts.findIndex((p) => p.slug === params.slug);
  if (index === -1) notFound();
  const post = posts[index];
  const next = posts[(index + 1) % posts.length];

  return (
    <SitePage>
      <article className="pt-36 pb-16">
        <div className="mx-auto max-w-[720px] px-5">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[13px] text-[#0D2B22]/60 hover:text-[#0D2B22] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> All articles
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#0D2B22] text-[#D4F53C]">
              {post.tag}
            </span>
            <span className="text-[12px] text-[#0D2B22]/55">
              {post.date} · {post.readTime}
            </span>
          </div>
          <h1 className="text-[32px] md:text-[42px] font-semibold tracking-tight text-[#0D2B22] mb-4">
            {post.title}
          </h1>
          <p className="text-[16px] leading-relaxed text-[#0D2B22]/60 mb-10">
            {post.excerpt}
          </p>
          <div className="space-y-8">
            {post.body.map((block, i) => (
              <div key={i}>
                {block.heading && (
                  <h2 className="text-[22px] font-semibold tracking-tight text-[#0D2B22] mb-3">
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
            href={`/blog/${next.slug}`}
            className="group flex items-center justify-between gap-4 mt-14 rounded-2xl bg-[#0D2B22] p-6 hover:bg-[#1A4435] transition-colors"
          >
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#9FCEBE] uppercase mb-1">
                Next article
              </p>
              <p className="text-[15px] font-semibold text-[#F2FFEE]">{next.title}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-[#D4F53C] shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </article>
    </SitePage>
  );
}
