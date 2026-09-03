"use client";

import { Search, Share2 } from "lucide-react";

interface Props {
  title: string;
}

export default function ChatHeader({ title }: Props) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface/80 backdrop-blur-sm shrink-0">
      <h1 className="text-[15px] font-semibold text-text-primary">{title}</h1>
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors">
          <Search className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors relative">
          <Share2 className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-green border-2 border-surface" />
        </button>
      </div>
    </header>
  );
}
