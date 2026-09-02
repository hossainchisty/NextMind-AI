"use client";

import { useState, useRef } from "react";

interface Props {
  onSend: (text: string) => void;
}

function ISend() { return (<svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>); }

function IAttach() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>); }

export default function ChatInput({ onSend }: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  function send() {
    const v = value.trim();
    if (!v) return;
    onSend(v);
    setValue("");
    if (ref.current) ref.current.value = "";
  }

  return (
    <div className="px-6 pb-5 pt-2 shrink-0">
      <div className="w-full max-w-[768px] mx-auto bg-surface border border-border rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus-within:border-primary/30 transition-all">
        <textarea
          ref={ref}
          placeholder="Ask NextMind anything..."
          rows={1}
          onChange={e => setValue(e.target.value)}
          className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-[15px] text-text-primary placeholder:text-text-secondary/60 focus:outline-none leading-relaxed"
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"><IAttach/></button>
          </div>
          <button
            onClick={send}
            disabled={!value.trim()}
            className="p-2.5 rounded-[10px] bg-primary text-white disabled:text-text-secondary/40 disabled:cursor-not-allowed transition-colors"
          ><ISend/></button>
        </div>
      </div>
    </div>
  );
}
