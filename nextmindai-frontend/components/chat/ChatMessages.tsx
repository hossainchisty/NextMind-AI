"use client";

import type { Msg } from "@/lib/types";
import { renderMarkdown } from "@/components/ui/Markdown";

interface Props {
  messages: Msg[];
  retrieving: boolean;
}

function IBrain() { return (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="6" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="18" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="12" cy="20" r="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".15"/><line x1="12" y1="8.5" x2="7.5" y2="12" stroke="currentColor" strokeWidth="1.5" opacity=".4"/><line x1="12" y1="8.5" x2="16.5" y2="12" stroke="currentColor" strokeWidth="1.5" opacity=".4"/><line x1="6" y1="16.5" x2="10.5" y2="19" stroke="currentColor" strokeWidth="1.5" opacity=".4"/><line x1="18" y1="16.5" x2="13.5" y2="19" stroke="currentColor" strokeWidth="1.5" opacity=".4"/></svg>); }

export default function ChatMessages({ messages, retrieving }: Props) {
  return (
    <div className="max-w-[768px] mx-auto px-6 py-6 space-y-6">
      {messages.map(m => (
        <div key={m.id} className={`animate-fade-in ${m.role === "user" ? "flex justify-end" : ""}`}>
          {m.role === "user" ? (
            <div className="max-w-[65%] px-4 py-3 rounded-[14px] bg-primary text-white text-[14px] leading-relaxed">{m.content}</div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 mt-0.5"><IBrain/></div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="text-[13px] font-medium text-primary mb-2">NextMind AI</div>
                <div>{renderMarkdown(m.content)}</div>
              </div>
            </div>
          )}
        </div>
      ))}
      {retrieving && (
        <div className="animate-fade-in flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin"/>
          <span className="text-[13px] font-medium text-text-secondary">Searching your knowledge</span>
        </div>
      )}
    </div>
  );
}
