"use client";

import { renderMarkdown } from "@/components/ui/Markdown";
import type { Msg } from "@/lib/types";
import { useState, useRef, useEffect } from "react";
import { BrainNodeIcon } from "@/components/ui/Icons";
import { Edit, Check, X } from "lucide-react";

interface Props {
  messages: Msg[];
  retrieving: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
}

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
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button onClick={() => saveEdit(m.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-btn text-btn-text hover:bg-btn-hover transition-colors">
                    <Check className="w-3.5 h-3.5" /> Save & Send
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
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          ) : (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <BrainNodeIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="text-[13px] font-medium mb-2"><span className="text-text-primary">Next</span><span className="text-btn-text">Mind</span></div>
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
