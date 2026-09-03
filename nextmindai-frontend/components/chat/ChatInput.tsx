"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { useClickOutside } from "@/hooks/useClickOutside";
import { SendIcon, AttachIcon, ChevronIcon, ProviderLogo } from "@/components/ui/Icons";
import { ProviderLogo as ProviderLogoType } from "@/components/ui/Icons";
import type { ProviderModel } from "@/lib/types";

interface Props {
  onSend: (text: string, provider?: string, model?: string) => void;
  selectedProvider?: string;
  selectedModel?: string;
  onModelChange?: (provider: string, model: string) => void;
}

const CAPABILITY_LABELS: Record<string, string> = {
  vision: "Vision",
  function_calling: "Tools",
  json_mode: "JSON",
  reasoning: "Reasoning",
  extended_thinking: "Thinking",
  grounding: "Grounding",
  rag: "RAG",
  web_search: "Web Search",
  routing: "Routing",
};

export default function ChatInput({ onSend, selectedProvider, selectedModel, onModelChange }: Props) {
  const [value, setValue] = useState("");
  const [providers, setProviders] = useState<ProviderModel[]>([]);
  const [localProvider, setLocalProvider] = useState<string>("");
  const [localModel, setLocalModel] = useState<string>("");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [pricingFilter, setPricingFilter] = useState<"all" | "free" | "paid">("all");
  const ref = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const activeProvider = selectedProvider || localProvider;
  const activeModel = selectedModel || localModel;

  useEffect(() => {
    api<{ data: Record<string, ProviderModel> }>("auth/models/").then((res) => {
      const list = Object.values(res.data || {});
      setProviders(list);
      if (list.length > 0 && !selectedProvider) {
        const first = list[0];
        setLocalProvider(first.provider.value);
        if (first.models.length > 0) setLocalModel(first.models[0].id);
      }
    }).catch(() => {});
  }, [selectedProvider]);

  useClickOutside(pickerRef, () => setShowModelPicker(false));

  function send() {
    const v = value.trim();
    if (!v) return;
    onSend(v, activeProvider || undefined, activeModel || undefined);
    setValue("");
    if (ref.current) ref.current.value = "";
  }

  const currentProvider = providers.find((p) => p.provider.value === activeProvider);
  const currentModel = currentProvider?.models.find((m) => m.id === activeModel);

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
            <button className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors">
              <AttachIcon />
            </button>
          </div>
          <div className="flex items-center gap-1">
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
                  <ChevronIcon direction="down" className="w-3 h-3" />
                </button>
                {showModelPicker && (
                  <div className="absolute bottom-full right-0 mb-2 w-[380px] bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-50 max-h-[480px] overflow-y-auto">
                    <div className="sticky top-0 bg-surface border-b border-border px-3 py-2 flex items-center gap-2 z-10">
                      {(["all", "free", "paid"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setPricingFilter(f)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                            pricingFilter === f
                              ? "bg-primary text-white"
                              : "text-text-secondary hover:bg-bg"
                          }`}
                        >
                          {f === "all" ? "All" : f === "free" ? "Free" : "Paid"}
                        </button>
                      ))}
                    </div>
                    {providers.map((pm) => {
                      const filtered = pm.models.filter((m) => {
                        if (pricingFilter === "all") return true;
                        if (pricingFilter === "free") return m.pricing_type === "free" || m.pricing_type === "freemium";
                        return m.pricing_type === "paid";
                      });
                      if (filtered.length === 0) return null;
                      return (
                        <div key={pm.provider.value}>
                          <div className="px-3 pt-3 pb-1.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2 sticky top-[37px] bg-surface">
                            <ProviderLogo logo_url={pm.provider.logo_url} color={pm.provider.color} label={pm.provider.label} />
                            {pm.provider.label}
                          </div>
                          {filtered.map((m) => (
                            <div
                              key={m.id}
                              className={`px-3 py-2.5 transition-colors cursor-pointer ${
                                activeProvider === pm.provider.value && activeModel === m.id
                                  ? "bg-primary/10"
                                  : "hover:bg-bg"
                              }`}
                              onClick={() => {
                                setLocalProvider(pm.provider.value);
                                setLocalModel(m.id);
                                if (onModelChange) onModelChange(pm.provider.value, m.id);
                                setShowModelPicker(false);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[13px] font-medium ${activeProvider === pm.provider.value && activeModel === m.id ? "text-primary" : "text-text-primary"}`}>
                                    {m.name}
                                  </span>
                                  {activeProvider === pm.provider.value && activeModel === m.id && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-primary/10 text-primary">Active</span>
                                  )}
                                  {m.pricing_type === "free" && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-600">FREE</span>
                                  )}
                                  {m.pricing_type === "freemium" && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/10 text-amber-600">FREE TIER</span>
                                  )}
                                </div>
                                <span className="text-[11px] text-text-secondary font-mono">{m.context}</span>
                              </div>
                              <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">{m.description}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] text-text-secondary">
                                  <span className="text-text-secondary/60">In</span> {m.input_price}
                                  <span className="text-text-secondary/60 mx-0.5">/</span>
                                  <span className="text-text-secondary/60">Out</span> {m.output_price}
                                  <span className="text-text-secondary/60">/1M</span>
                                </span>
                                {m.capabilities.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    {m.capabilities.map((cap) => (
                                      <span key={cap} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-primary/5 text-primary/70">
                                        {CAPABILITY_LABELS[cap] || cap}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={send}
              disabled={!value.trim()}
              className="p-2.5 rounded-[10px] bg-primary text-white disabled:text-text-secondary/40 disabled:cursor-not-allowed transition-colors"
            >
              <SendIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
