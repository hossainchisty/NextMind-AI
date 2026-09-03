"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

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

function ProviderLogo({ logo_url, color, label, size = "md" }: { logo_url: string | null; color: string; label: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "w-10 h-10" : size === "md" ? "w-8 h-8" : "w-6 h-6";
  const t = size === "lg" ? "text-[14px]" : size === "md" ? "text-[12px]" : "text-[10px]";
  if (logo_url) return <img src={logo_url} className={`${s} rounded-lg`} alt="" />;
  return <span className={`${s} rounded-lg flex items-center justify-center ${t} font-bold text-white`} style={{ backgroundColor: color }}>{label[0]}</span>;
}

function PlusIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function XIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function MoreIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>; }
function TrashIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>; }
function KeyIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>; }
function CheckIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [connectModal, setConnectModal] = useState<Provider | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingKeys, setFetchingKeys] = useState(true);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [testError, setTestError] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    api<{ data: Provider[] }>("auth/providers").then((res) => setProviders(res.data)).catch(() => {});
    api<{ data: APIKey[] }>("auth/api-keys").then((res) => { setKeys(res.data); setFetchingKeys(false); }).catch(() => setFetchingKeys(false));
  }, []);

  const connectedMap = new Map(keys.map((k) => [k.provider_detail.value, k]));
  const connectedProviders = providers.filter((p) => connectedMap.has(p.value));
  const unconnectedProviders = providers.filter((p) => !connectedMap.has(p.value));

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim() || !connectModal) return;
    setLoading(true);
    try {
      const res = await api<{ data: APIKey }>("auth/api-keys", {
        method: "POST",
        json: { provider: connectModal.value, api_key: apiKey.trim() },
      });
      setKeys((prev) => [res.data, ...prev]);
      setApiKey("");
      setConnectModal(null);
      setTestStatus("idle");
    } catch (err: any) {
      alert(err?.detail || err?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this key?")) return;
    try {
      await api(`auth/api-keys/${id}`, { method: "DELETE" });
      setKeys((prev) => prev.filter((k) => k.id !== id));
      setMenuOpen(null);
    } catch { alert("Failed to delete"); }
  }

  async function handleTest() {
    if (!apiKey.trim() || !connectModal) return;
    setTestStatus("testing");
    setTestError("");
    try {
      await api("auth/api-keys/test", { method: "POST", json: { provider: connectModal.value, api_key: apiKey.trim() } });
      setTestStatus("ok");
    } catch (err: any) {
      setTestStatus("error");
      setTestError(err?.detail || "Connection failed");
    }
  }

  function timeAgo(date: string) {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-text-primary mb-1">Provider Keys</h1>
            <p className="text-[14px] text-text-secondary">Securely manage and monitor your API keys</p>
          </div>
          {unconnectedProviders.length > 0 && (
            <button
              onClick={() => { setConnectModal(unconnectedProviders[0]); setTestStatus("idle"); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <PlusIcon /> Add provider key
            </button>
          )}
        </div>
      </div>

      {/* Provider Keys List */}
      <div className="space-y-3 mb-8">
        {keys.length === 0 && !fetchingKeys ? (
          <div className="flex flex-col items-center justify-center py-16 bg-surface border border-border border-dashed rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <KeyIcon />
            </div>
            <p className="text-[14px] font-medium text-text-primary mb-1">No provider keys yet</p>
            <p className="text-[13px] text-text-secondary mb-4">Add your first provider key to get started</p>
            {unconnectedProviders.length > 0 && (
              <button
                onClick={() => { setConnectModal(unconnectedProviders[0]); setTestStatus("idle"); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
              >
                <PlusIcon /> Add Provider Key
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Your Providers */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">Your providers</h2>
                <span className="text-[13px] text-text-secondary">{keys.length} key{keys.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="space-y-3">
                {connectedProviders.map((p) => {
                  const k = connectedMap.get(p.value)!;
                  return (
                    <div key={p.value} className="bg-surface border border-border rounded-xl p-4 hover:border-primary/20 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <ProviderLogo logo_url={p.logo_url} color={p.color} label={p.label} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-semibold text-text-primary">{p.label}</span>
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-green/10 text-accent-green">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                                active
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[12px] font-mono text-text-secondary">••••••••</span>
                              <span className="text-[11px] text-text-secondary/40">•</span>
                              <span className="text-[11px] text-text-secondary/60">Last used {timeAgo(k.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => setMenuOpen(menuOpen === k.id ? null : k.id)}
                            className="p-2 rounded-lg text-text-secondary/40 hover:text-text-primary hover:bg-bg transition-colors"
                          >
                            <MoreIcon />
                          </button>
                          {menuOpen === k.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-10">
                              <button
                                onClick={() => handleDelete(k.id)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <TrashIcon /> Remove key
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Another Provider */}
      {unconnectedProviders.length > 0 && (
        <div>
          <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-3">Add another provider</h2>
          <div className="grid grid-cols-2 gap-2">
            {unconnectedProviders.map((p) => (
              <button
                key={p.value}
                onClick={() => { setConnectModal(p); setTestStatus("idle"); }}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:border-primary/20 hover:bg-primary/5 transition-all text-left"
              >
                <ProviderLogo logo_url={p.logo_url} color={p.color} label={p.label} />
                <span className="text-[13px] text-text-primary font-medium">{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Connect Modal */}
      {connectModal && (
        <div
          className="fixed inset-0 flex items-start justify-center z-50 p-4 pt-12 overflow-y-auto animate-fade-in"
          onClick={() => { setConnectModal(null); setTestStatus("idle"); }}
        >
          <div
            className="bg-surface border border-border rounded-2xl w-full max-w-[440px] shadow-xl overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-4 px-6 pt-6 pb-5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${connectModal.color}12` }}>
                <ProviderLogo logo_url={connectModal.logo_url} color={connectModal.color} label={connectModal.label} size="md" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[15px] font-semibold text-text-primary leading-tight">Add {connectModal.label} Key</h2>
                {/* <p className="text-[12px] font-mono text-text-secondary truncate">{connectModal.endpoint.replace("https://", "")}</p> */}
              </div>
              <button
                onClick={() => { setConnectModal(null); setTestStatus("idle"); }}
                className="w-8 h-8 rounded-full bg-bg border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-primary/20 transition-colors shrink-0"
              >
                <XIcon />
              </button>
            </div>

            <div className="h-px bg-border" />

            <form onSubmit={handleConnect} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">API Key</label>
                <div className="relative">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => { setApiKey(e.target.value); setTestStatus("idle"); }}
                    placeholder={connectModal.placeholder}
                    required
                    className="w-full px-4 py-3 pr-4 rounded-xl bg-bg border border-border text-[13px] font-mono text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-text-secondary mt-2">Find your key in the {connectModal.label} dashboard.</p>
              </div>

              <div className="flex items-center gap-2 py-1">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={!apiKey.trim() || testStatus === "testing"}
                  className="px-3.5 py-2 rounded-lg border border-border bg-bg text-[12px] font-medium text-text-secondary hover:text-text-primary hover:border-primary/30 hover:bg-surface transition-colors disabled:opacity-40 flex items-center gap-1.5"
                >
                  {testStatus === "testing" ? <span className="w-3 h-3 border-2 border-text-secondary/30 border-t-text-secondary rounded-full animate-spin" /> : null}
                  {testStatus === "testing" ? "Testing..." : "Test connection"}
                </button>
                {testStatus === "ok" && <span className="flex items-center gap-1 text-[12px] font-medium text-accent-green"><CheckIcon /> Connected</span>}
                {testStatus === "error" && <span className="text-[12px] text-red-500">{testError}</span>}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setConnectModal(null); setTestStatus("idle"); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-bg text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !apiKey.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors shadow-sm"
                >
                  {loading ? "Connecting..." : "Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
