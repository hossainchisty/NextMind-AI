"use client";

import { renderMarkdown } from "@/components/ui/Markdown";
import type { Msg } from "@/lib/types";
import { useState, useRef, useEffect } from "react";

interface Props {
  messages: Msg[];
  retrieving: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
}

function IBrain() { return (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1" /><circle cx="6" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1" /><circle cx="18" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1" /><circle cx="12" cy="20" r="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".15" /><line x1="12" y1="8.5" x2="7.5" y2="12" stroke="currentColor" strokeWidth="1.5" opacity=".4" /><line x1="12" y1="8.5" x2="16.5" y2="12" stroke="currentColor" strokeWidth="1.5" opacity=".4" /><line x1="6" y1="16.5" x2="10.5" y2="19" stroke="currentColor" strokeWidth="1.5" opacity=".4" /><line x1="18" y1="16.5" x2="13.5" y2="19" stroke="currentColor" strokeWidth="1.5" opacity=".4" /></svg>); }

function EditIcon() { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>; }
function CheckIcon() { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>; }
function XIcon() { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }

export default function ChatMessages({ messages, retrieving, onEdit }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingId && textareaRef.current) {
      const t = textareaRef.current;
      t.style.height = 'auto';
      t.style.height = Math.min(t.scrollHeight, 200) + 'px';
    }
  }, [editingId, editText]);

  function startEdit(msg: Msg) {
    setEditingId(msg.id);
    setEditText(msg.content);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  function saveEdit(msgId: string) {
    if (editText.trim() && onEdit) {
      onEdit(msgId, editText.trim());
    }
    setEditingId(null);
    setEditText("");
  }

  return (
    <div className="max-w-[768px] mx-auto px-6 py-6 space-y-6">
      {messages.map(m => (
        <div key={m.id} className={`animate-fade-in group ${m.role === "user" ? "flex justify-end" : ""}`}>
          {m.role === "user" ? (
            editingId === m.id ? (
              <div className="max-w-[65%]">
                <div className="px-4 py-3 rounded-[14px] bg-primary text-white">
                  <textarea
                    ref={textareaRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-transparent text-[14px] leading-relaxed resize-none focus:outline-none min-h-[24px] max-h-[200px] overflow-auto placeholder:text-white/60"
                    autoFocus
                    rows={1}
                    onInput={(e) => {
                      const t = e.target as HTMLTextAreaElement;
                      t.style.height = 'auto';
                      t.style.height = Math.min(t.scrollHeight, 200) + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        saveEdit(m.id);
                      }
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 mt-2 justify-end">
                  <button onClick={cancelEdit} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium text-text-secondary hover:text-text-primary hover:bg-bg transition-colors">
                    <XIcon /> Cancel
                  </button>
                  <button onClick={() => saveEdit(m.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-primary text-white hover:bg-primary/90 transition-colors">
                    <CheckIcon /> Save & Send
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-[65%] relative group/msg">
                <div className="px-4 py-3 rounded-[14px] bg-primary text-white text-[14px] leading-relaxed">{m.content}</div>
                <button
                  onClick={() => startEdit(m)}
                  className="absolute -left-10 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-text-secondary/50 hover:text-text-primary hover:bg-bg transition-all opacity-0 group-hover/msg:opacity-100"
                  title="Edit message"
                >
                  <EditIcon />
                </button>
              </div>
            )
          ) : (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 mt-0.5"><IBrain /></div>
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
          <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <span className="text-[13px] font-medium text-text-secondary">Searching your knowledge</span>
        </div>
      )}
    </div>
  );
}
