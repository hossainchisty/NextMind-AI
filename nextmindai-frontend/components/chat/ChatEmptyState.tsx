"use client";

interface Props {
  onAsk: (text: string) => void;
}

function ISearch() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>); }
function IDoc() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>); }
function IFile() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>); }
function IChat() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>); }

export default function ChatEmptyState({ onAsk }: Props) {
  const actions = [
    { Icon: ISearch, t: "Search documents", d: "Find anything across your knowledge base", p: "Search my documents for" },
    { Icon: IDoc, t: "Analyze a file", d: "Extract insights from your documents", p: "Analyze this document and summarize" },
    { Icon: IFile, t: "Explain a concept", d: "Get clear answers grounded in your docs", p: "Explain the concept of" },
    { Icon: IChat, t: "Summarize knowledge", d: "Create summaries from your sources", p: "Summarize the key points about" },
  ];

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 min-h-full relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.02] blur-3xl"/>
        <div className="absolute top-[20%] right-[15%] w-[300px] h-[300px] rounded-full bg-soft-accent/40 blur-3xl"/>
      </div>
      <div className="relative z-10 flex flex-col items-center max-w-[640px] w-full">
        {/* <div className="relative mb-8">
          <div className="w-20 h-20 rounded-[22px] bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-[0_8px_32px_rgba(13,43,35,0.15)]">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="6" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="18" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="12" cy="20" r="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".15"/><line x1="12" y1="8.5" x2="7.5" y2="12" stroke="currentColor" strokeWidth="1.5" opacity=".4"/><line x1="12" y1="8.5" x2="16.5" y2="12" stroke="currentColor" strokeWidth="1.5" opacity=".4"/></svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent-green border-[3px] border-bg flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white"/></div>
        </div> */}
        <h1 className="text-[32px] font-bold tracking-tight text-text-primary mb-3 text-center">Your private AI workspace</h1>
        <p className="text-[15px] text-text-secondary text-center max-w-[440px] leading-relaxed mb-12">Ask questions, explore your documents, and discover insights — all running locally on your device.</p>
        <div className="grid grid-cols-2 gap-3 w-full mb-10">
          {actions.map((action, i) => {
            const Icon: React.ComponentType<{className?: string}> = action.Icon;
            return (
              <button key={action.t} onClick={() => onAsk(action.p)} className="group flex items-start gap-3.5 p-4 rounded-[14px] bg-surface border border-border hover:border-primary/20 hover:shadow-[0_4px_20px_rgba(13,43,35,0.06)] transition-all duration-200 text-left animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="w-9 h-9 rounded-[10px] bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors"><Icon className="w-4 h-4 text-primary"/></div>
                <div><div className="text-[13px] font-semibold text-text-primary mb-0.5 group-hover:text-primary transition-colors">{action.t}</div><div className="text-[12px] text-text-secondary leading-snug">{action.d}</div></div>
              </button>
            );
          })}
                  </div>
                </div>
              </div>
  );
}
