"use client";

import { SearchIcon, DocumentIcon, FileTextIcon, ChatIcon } from "@/components/ui/Icons";

interface Props {
  onAsk: (text: string) => void;
}

export default function ChatEmptyState({ onAsk }: Props) {
  const actions = [
    { Icon: SearchIcon, t: "Search documents", d: "Find anything across your knowledge base", p: "Search my documents for" },
    { Icon: DocumentIcon, t: "Analyze a file", d: "Extract insights from your documents", p: "Analyze this document and summarize" },
    { Icon: FileTextIcon, t: "Explain a concept", d: "Get clear answers grounded in your docs", p: "Explain the concept of" },
    { Icon: ChatIcon, t: "Summarize knowledge", d: "Create summaries from your sources", p: "Summarize the key points about" },
  ];

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 min-h-full relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.02] blur-3xl"/>
        <div className="absolute top-[20%] right-[15%] w-[300px] h-[300px] rounded-full bg-soft-accent/40 blur-3xl"/>
      </div>
      <div className="relative z-10 flex flex-col items-center max-w-[640px] w-full">
        <h1 className="text-[32px] font-bold tracking-tight text-text-primary mb-3 text-center">Your private AI workspace</h1>
        <p className="text-[15px] text-text-secondary text-center max-w-[440px] leading-relaxed mb-12">Ask questions, explore your documents, and discover insights — all running locally on your device.</p>
        <div className="grid grid-cols-2 gap-3 w-full mb-10">
          {actions.map((action, i) => {
            const Icon: React.ComponentType<{className?: string}> = action.Icon;
            return (
              <button key={action.t} onClick={() => onAsk(action.p)} className="group flex items-start gap-3.5 p-4 rounded-[14px] bg-surface border border-border hover:border-primary/20 hover:shadow-[0_4px_20px_rgba(13,43,35,0.06)] transition-all duration-200 text-left animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="w-9 h-9 rounded-[10px] bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Icon className="w-4 h-4 text-primary"/>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-text-primary mb-0.5 group-hover:text-primary transition-colors">{action.t}</div>
                  <div className="text-[12px] text-text-secondary leading-snug">{action.d}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
