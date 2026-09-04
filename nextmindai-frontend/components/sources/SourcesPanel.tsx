"use client";

import type { Source } from "@/lib/types";

interface Props {
  sources: Source[];
}

function IFile() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>); }

export default function SourcesPanel({ sources }: Props) {
  return (
    <aside className="w-[320px] h-full border-l border-border bg-surface overflow-hidden flex flex-col shrink-0">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="text-[14px] font-semibold text-text-primary">Sources</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sources.map(s => (
          <div key={s.id} className="p-4 rounded-[12px] bg-bg border border-border hover:border-primary/20 transition-all cursor-pointer">
            <div className="flex items-start gap-3 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0"><IFile/></div>
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-text-primary line-clamp-1">{s.documentName}</div>
                <div className="text-[12px] text-text-secondary mt-0.5">{s.section}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[11px] text-text-secondary">Page {s.page}</span>
              <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${s.relevance === "High" ? "text-accent-green bg-accent-green/10" : "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10"}`}>{s.relevance}</span>
            </div>
            <p className="text-[12px] text-text-secondary/80 leading-relaxed line-clamp-2">&ldquo;{s.preview}&rdquo;</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
