"use client";

function ISearch() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>); }
function IShare() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>); }

interface Props {
  title: string;
}

export default function ChatHeader({ title }: Props) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface/80 backdrop-blur-sm shrink-0">
      <h1 className="text-[15px] font-semibold text-text-primary">{title}</h1>
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"><ISearch/></button>
        <button className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors relative">
          <IShare/>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-green border-2 border-surface"/>
        </button>
      </div>
    </header>
  );
}
