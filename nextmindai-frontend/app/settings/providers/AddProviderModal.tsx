"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

interface Provider {
  id: string;
  value: string;
  label: string;
  endpoint: string;
  placeholder: string;
  logo: string;
  logo_url: string;
  color: string;
}

interface APIKey {
  id: string;
  provider: { value: string; label: string };
  provider_detail: Provider;
  api_key: string;
  api_key_masked: string;
  is_active: boolean;
  created_at: string;
}

interface Props {
  unconnectedProviders: Provider[];
  onConnected: (key: APIKey) => void;
  initialProvider?: Provider | null;
  variant?: "button" | "grid";
}

function ProviderLogo({ logo_url, color, label, size = "md" }: { logo_url: string | null; color: string; label: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "w-10 h-10" : size === "md" ? "w-8 h-8" : "w-6 h-6";
  const t = size === "lg" ? "text-[14px]" : size === "md" ? "text-[12px]" : "text-[10px]";
  if (logo_url) return <img src={logo_url} className={`${s} rounded-lg`} alt="" />;
  return <span className={`${s} rounded-lg flex items-center justify-center ${t} font-bold text-white`} style={{ backgroundColor: color }}>{label[0]}</span>;
}

function CheckIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function XIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function ChevronDown() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>; }

export default function AddProviderModal({ unconnectedProviders, onConnected, initialProvider, variant = "button" }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [testError, setTestError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleOpen(provider?: Provider) {
    setOpen(true);
    setSelectedProvider(provider || unconnectedProviders[0] || null);
    setApiKey("");
    setTestStatus("idle");
    setTestError("");
  }

  function handleClose() {
    setOpen(false);
    setSelectedProvider(null);
    setApiKey("");
    setTestStatus("idle");
    setTestError("");
  }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim() || !selectedProvider) return;
    setLoading(true);
    setTestStatus("testing");
    setTestError("");
    try {
      await api("auth/api-keys/test", { method: "POST", json: { provider: selectedProvider.value, api_key: apiKey.trim() } });
      setTestStatus("ok");
      const res = await api<{ data: APIKey }>("auth/api-keys", {
        method: "POST",
        json: { provider: selectedProvider.value, api_key: apiKey.trim() },
      });
      onConnected(res.data);
      toast(`${selectedProvider.label} connected`, "success");
      setTimeout(() => handleClose(), 800);
    } catch (err: any) {
      setTestStatus("error");
      setTestError(err?.message || err?.detail || "Connection failed");
    } finally {
      setLoading(false);
    }
  }

  if (unconnectedProviders.length === 0) return null;

  const triggerProvider = initialProvider || unconnectedProviders[0];

  return (
    <>
      {variant === "grid" ? (
        <button
          onClick={() => handleOpen(triggerProvider)}
          className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:border-primary/20 hover:bg-primary/5 transition-all text-left"
        >
          <ProviderLogo logo_url={triggerProvider.logo_url} color={triggerProvider.color} label={triggerProvider.label} />
          <span className="text-[13px] text-text-primary font-medium">{triggerProvider.label}</span>
        </button>
      ) : (
        <button
          onClick={() => handleOpen()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Provider Key
        </button>
      )}

      {open && (
        <div className="fixed inset-0 flex items-start justify-center z-50 p-4 pt-12 overflow-y-auto animate-fade-in" onClick={handleClose}>
          <div className="bg-surface border border-border rounded-2xl w-full max-w-[440px] shadow-xl overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-[16px] font-semibold text-text-primary">Add provider key</h2>
              <button onClick={handleClose} className="w-8 h-8 rounded-full bg-bg border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-primary/20 transition-colors">
                <XIcon />
              </button>
            </div>

            <div className="h-px bg-border" />

            <form onSubmit={handleConnect} className="px-6 py-5 space-y-4">
              {/* Provider Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Provider</label>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-bg border border-border text-[13px] text-text-primary hover:border-primary/30 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      {selectedProvider ? (
                        <ProviderLogo logo_url={selectedProvider.logo_url} color={selectedProvider.color} label={selectedProvider.label} />
                      ) : (
                        <span className="w-8 h-8 rounded-lg bg-border/50" />
                      )}
                      {selectedProvider?.label || "Select provider"}
                    </span>
                    <ChevronDown />
                  </button>
                  {showDropdown && (
                    <div className="absolute z-20 w-full mt-2 rounded-xl bg-surface border border-border shadow-xl overflow-hidden max-h-[240px] overflow-y-auto">
                      {unconnectedProviders.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => { setSelectedProvider(p); setShowDropdown(false); setTestStatus("idle"); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] transition-colors ${
                            selectedProvider?.value === p.value ? "bg-primary/10 text-primary" : "text-text-primary hover:bg-bg"
                          }`}
                        >
                          <ProviderLogo logo_url={p.logo_url} color={p.color} label={p.label} />
                          <span className="flex-1 text-left">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => { setApiKey(e.target.value); setTestStatus("idle"); }}
                  placeholder={selectedProvider?.placeholder || "Enter your API key"}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-[13px] font-mono text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                  autoFocus
                />
                <p className="text-[11px] text-text-secondary mt-2">Find your key in the {selectedProvider?.label || "provider"} dashboard.</p>
              </div>

              {/* Error */}
              {testStatus === "error" && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                  <span className="text-[12px] text-red-600">{testError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-bg text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !apiKey.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {testStatus === "testing" && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {testStatus === "ok" ? "Connected" : testStatus === "testing" ? "Testing..." : loading ? "Saving..." : "Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
