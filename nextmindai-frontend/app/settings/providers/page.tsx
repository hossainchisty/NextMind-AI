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
  label: string;
  api_key: string;
  api_key_masked: string;
  is_active: boolean;
  created_at: string;
}

function ProviderLogo({ logo_url, color, label, size = "md" }: { logo_url: string | null; color: string; label: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "w-10 h-10" : size === "md" ? "w-8 h-8" : "w-5 h-5";
  const t = size === "lg" ? "text-[14px]" : size === "md" ? "text-[12px]" : "text-[10px]";
  if (logo_url) return <img src={logo_url} className={`${s} rounded-lg`} alt="" />;
  return <span className={`${s} rounded-lg flex items-center justify-center ${t} font-bold text-white`} style={{ backgroundColor: color }}>{label[0]}</span>;
}

function CheckIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function TrashIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>; }
function KeyIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>; }
function PlusIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function XIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }

export default function PersonalizationPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingKeys, setFetchingKeys] = useState(true);
  const [success, setSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [testError, setTestError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    api<{ data: Provider[] }>("auth/providers").then((res) => setProviders(res.data)).catch(() => {});
    api<{ data: APIKey[] }>("auth/api-keys").then((res) => { setKeys(res.data); setFetchingKeys(false); }).catch(() => setFetchingKeys(false));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest('.provider-dropdown')) setShowDropdown(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim() || !selectedProvider) return;
    setLoading(true);
    setSuccess(false);
    try {
      const res = await api<{ data: APIKey }>("auth/api-keys", {
        method: "POST",
        json: { provider: selectedProvider, api_key: apiKey.trim() },
      });
      setKeys((prev) => [res.data, ...prev]);
      setApiKey("");
      setSelectedProvider("");
      setSuccess(true);
      setShowForm(false);
      setTimeout(() => setSuccess(false), 2000);
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
    } catch { alert("Failed to delete"); }
  }

  async function handleTest() {
    if (!apiKey.trim() || !selectedProvider) return;
    setTestStatus("testing");
    setTestError("");
    try {
      await api("auth/api-keys/test", { method: "POST", json: { provider: selectedProvider, api_key: apiKey.trim() } });
      setTestStatus("ok");
    } catch (err: any) {
      setTestStatus("error");
      setTestError(err?.detail || "Connection failed");
    }
  }

  const currentProvider = providers.find((p) => p.value === selectedProvider);
  const connectedProviderValues = new Set(keys.map((k) => k.provider_detail.value));

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-text-primary mb-1">Providers</h1>
          <p className="text-[14px] text-text-secondary">Connect your own API keys to use your preferred models.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <PlusIcon /> Add Provider
          </button>
        )}
      </div>

      {/* Add Key Form */}
      {showForm && (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-6 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <KeyIcon />
              </div>
              <h2 className="text-[15px] font-semibold text-text-primary">Add Provider</h2>
            </div>
            <button onClick={() => { setShowForm(false); setTestStatus("idle"); }} className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors">
              <XIcon />
            </button>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-2 uppercase tracking-wider">Provider</label>
              <div className="relative provider-dropdown">
                <div
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-[13px] text-text-primary cursor-pointer hover:border-primary/30 transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-2.5">
                    {currentProvider ? (
                      <ProviderLogo logo_url={currentProvider.logo_url} color={currentProvider.color} label={currentProvider.label} />
                    ) : <span className="w-8 h-8 rounded-lg bg-border/50" />}
                    {currentProvider?.label || "Select a provider"}
                  </span>
                  <svg className={`w-4 h-4 text-text-secondary transition-transform ${showDropdown ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                {showDropdown && (
                  <div className="absolute z-20 w-full mt-2 rounded-xl bg-surface border border-border shadow-xl overflow-hidden">
                    {providers.map((p) => {
                      const connected = connectedProviderValues.has(p.value);
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => { setSelectedProvider(p.value); setShowDropdown(false); setTestStatus("idle"); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] transition-colors ${
                            selectedProvider === p.value ? "bg-primary/10 text-primary" : "text-text-primary hover:bg-bg"
                          }`}
                        >
                          <ProviderLogo logo_url={p.logo_url} color={p.color} label={p.label} />
                          <span className="flex-1 text-left">{p.label}</span>
                          {connected && <span className="text-[10px] text-accent-green font-medium">Connected</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-2 uppercase tracking-wider">Endpoint</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 rounded-xl bg-bg border border-border text-[13px] font-mono text-text-secondary">
                  {currentProvider?.endpoint || "—"}
                </div>
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={!apiKey.trim() || !selectedProvider || testStatus === "testing"}
                  className="px-4 py-3 rounded-xl border border-border text-[12px] font-medium text-text-secondary hover:text-text-primary hover:border-primary/30 transition-colors disabled:opacity-40"
                >
                  {testStatus === "testing" ? "..." : "Test"}
                </button>
              </div>
              {testStatus === "ok" && <p className="mt-2 text-[12px] text-accent-green flex items-center gap-1"><CheckIcon /> Connection successful</p>}
              {testStatus === "error" && <p className="mt-2 text-[12px] text-red-500">{testError}</p>}
            </div>

            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-2 uppercase tracking-wider">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setTestStatus("idle"); }}
                placeholder={currentProvider?.placeholder || "Enter your API key"}
                required
                className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-[13px] font-mono text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || !apiKey.trim() || !selectedProvider}
                className="px-6 py-2.5 rounded-xl bg-primary text-white text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                {loading ? "Adding..." : "Add Key"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setTestStatus("idle"); }} className="px-4 py-2.5 rounded-xl text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors">
                Cancel
              </button>
              {success && <span className="flex items-center gap-1.5 text-[13px] text-accent-green"><CheckIcon /> Added</span>}
            </div>
          </form>
        </div>
      )}

      {/* Connected Providers Grid */}
      <div>
        <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-4">Connected</h2>
        {fetchingKeys ? (
          <div className="flex items-center justify-center py-16 text-text-secondary text-[13px]">Loading...</div>
        ) : keys.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center py-16 bg-surface border border-border border-dashed rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <KeyIcon />
            </div>
            <p className="text-[14px] font-medium text-text-primary mb-1">No keys connected</p>
            <p className="text-[13px] text-text-secondary mb-4">Add your first API key to get started</p>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors">
              <PlusIcon /> Add Key
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {keys.map((k) => {
              const p = k.provider_detail;
              return (
                <div key={k.id} className="group bg-surface border border-border rounded-2xl p-4 hover:border-primary/20 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${p.color || "#666"}12` }}>
                        <ProviderLogo logo_url={p.logo_url} color={p.color || "#666"} label={p.label} size="md" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-semibold text-text-primary">{p.label}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-green/10 text-accent-green">Active</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[12px] font-mono text-text-secondary">{k.api_key_masked}</span>
                          <span className="text-[11px] text-text-secondary/60">•</span>
                          <span className="text-[11px] text-text-secondary/60">{p.endpoint.replace("https://", "")}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(k.id)}
                      className="p-2 rounded-lg text-text-secondary/40 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
