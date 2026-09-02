"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";

interface ProviderModel {
  provider: { value: string; label: string; color: string; logo_url: string | null };
  models: Array<{ id: string; name: string }>;
}

interface Props {
  onSend: (text: string, provider?: string, model?: string) => void;
}

function ISend() { return (<svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>); }

function IAttach() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>); }

function ProviderLogo({ logo_url, color, label }: { logo_url: string | null; color: string; label: string }) {
  if (logo_url) return <img src={logo_url} className="w-4 h-4 rounded" alt="" />;
  return <span className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: color }}>{label[0]}</span>;
}

export default function ChatInput({ onSend }: Props) {
  const [value, setValue] = useState("");
  const [providers, setProviders] = useState<ProviderModel[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<{ data: Record<string, ProviderModel> }>("auth/models/").then((res) => {
      const list = Object.values(res.data || {});
      setProviders(list);
      if (list.length > 0) {
        const first = list[0];
        setSelectedProvider(first.provider.value);
        if (first.models.length > 0) setSelectedModel(first.models[0].id);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowModelPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function send() {
    const v = value.trim();
    if (!v) return;
    onSend(v, selectedProvider || undefined, selectedModel || undefined);
    setValue("");
    if (ref.current) ref.current.value = "";
  }

  const currentProvider = providers.find((p) => p.provider.value === selectedProvider);
  const currentModel = currentProvider?.models.find((m) => m.id === selectedModel);

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
            {providers.length > 0 && (
              <div className="relative" ref={pickerRef}>
                <button
                  onClick={() => setShowModelPicker(!showModelPicker)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] text-text-secondary hover:text-text-primary hover:bg-bg transition-colors border border-transparent hover:border-border"
                >
                  {currentProvider && (
                    <ProviderLogo logo_url={currentProvider.provider.logo_url} color={currentProvider.provider.color} label={currentProvider.provider.label} />
                  )}
                  <span className="max-w-[120px] truncate">{currentModel?.name || "Select model"}</span>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {showModelPicker && (
                  <div className="absolute bottom-full left-0 mb-2 w-[320px] bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-50">
                    {providers.map((pm) => (
                      <div key={pm.provider.value}>
                        <div className="px-3 pt-3 pb-1 text-[11px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                          <ProviderLogo logo_url={pm.provider.logo_url} color={pm.provider.color} label={pm.provider.label} />
                          {pm.provider.label}
                        </div>
                        {pm.models.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              setSelectedProvider(pm.provider.value);
                              setSelectedModel(m.id);
                              setShowModelPicker(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${
                              selectedProvider === pm.provider.value && selectedModel === m.id
                                ? "bg-primary/10 text-primary"
                                : "text-text-primary hover:bg-bg"
                            }`}
                          >
                            {m.name}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
