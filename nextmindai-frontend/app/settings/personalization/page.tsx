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

function ProviderLogo({ logo_url, color, label }: { logo_url: string | null; color: string; label: string }) {
  if (logo_url) return <img src={logo_url} className="w-5 h-5 rounded" alt="" />;
  return <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: color }}>{label[0]}</span>;
}

function CheckIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}

function TrashIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
}

export default function PersonalizationPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [provider, setProvider] = useState("");
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingProviders, setFetchingProviders] = useState(true);
  const [fetchingKeys, setFetchingKeys] = useState(true);
  const [success, setSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [testError, setTestError] = useState("");

  useEffect(() => {
    fetchProviders();
    fetchKeys();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.provider-dropdown')) {
        setShowProviderDropdown(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  async function fetchProviders() {
    try {
      const res = await api<{ data: Provider[] }>("auth/providers");
      setProviders(res.data);
    } catch {}
    finally { setFetchingProviders(false); }
  }

  async function fetchKeys() {
    try {
      const res = await api<{ data: APIKey[] }>("auth/api-keys");
      setKeys(res.data);
    } catch {}
    finally { setFetchingKeys(false); }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim() || !provider) return;
    setLoading(true);
    setSuccess(false);
    try {
      const res = await api<{ data: APIKey }>("auth/api-keys", {
        method: "POST",
        json: { provider, api_key: apiKey.trim() },
      });
      setKeys((prev) => [res.data, ...prev]);
      setApiKey("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      const msg = err?.detail || err?.provider?.[0] || err?.message || "Failed to save API key";
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this API key?")) return;
    try {
      await api(`auth/api-keys/${id}`, { method: "DELETE" });
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch { alert("Failed to delete"); }
  }

  async function handleTest() {
    if (!apiKey.trim() || !provider) return;
    setTestStatus("testing");
    setTestError("");
    try {
      await api("auth/api-keys/test", {
        method: "POST",
        json: { provider, api_key: apiKey.trim() },
      });
      setTestStatus("ok");
    } catch (err: any) {
      setTestStatus("error");
      setTestError(err?.detail || err?.message || "Connection failed");
    }
  }

  const selected = providers.find((p) => p.value === provider);

  return (
    <div className="animate-fade-in">
      <h1 className="text-[22px] font-semibold text-text-primary mb-1">AI Models</h1>
      <p className="text-[14px] text-text-secondary mb-8">
        Connect your own API keys to use your preferred models.
      </p>

      {/* Add Key Form */}
      <form onSubmit={handleAdd} className="bg-surface border border-border rounded-[12px] p-6 mb-6">
        <h2 className="text-[15px] font-semibold text-text-primary mb-4">Add New Key</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-text-primary mb-1.5">Provider</label>
            <div className="relative provider-dropdown">
              <div
                className="w-full max-w-[320px] px-4 py-2.5 rounded-lg bg-bg border border-border text-[13px] text-text-primary cursor-pointer focus:outline-none focus:border-primary/40 transition-colors flex items-center justify-between"
                onClick={() => setShowProviderDropdown(!showProviderDropdown)}
              >
                <span className="flex items-center gap-2">
                  {selected ? (
                    <ProviderLogo logo_url={selected.logo_url || ""} color={selected.color || "#666"} label={selected.label} />
                  ) : (
                    <span className="w-5 h-5" />
                  )}
                  {selected?.label || "Select a provider"}
                </span>
                <svg className={`w-4 h-4 text-text-secondary transition-transform ${showProviderDropdown ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              {showProviderDropdown && (
                <div className="absolute z-10 w-full max-w-[320px] mt-1 rounded-lg bg-bg border border-border shadow-lg max-h-48 overflow-auto">
                  {providers.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => { setProvider(p.value); setShowProviderDropdown(false); setTestStatus("idle"); setTestError(""); }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-[13px] transition-colors ${
                        provider === p.value ? "bg-primary/10 text-primary" : "text-text-primary hover:bg-primary/5"
                      }`}
                    >
                      <ProviderLogo logo_url={p.logo_url || ""} color={p.color || "#666"} label={p.label} />
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-text-primary mb-1.5">Endpoint</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 max-w-[320px] px-4 py-2.5 rounded-lg bg-bg border border-border text-[13px] font-mono text-text-secondary">
                {selected?.endpoint || "—"}
              </div>
              <button
                type="button"
                onClick={handleTest}
                disabled={!apiKey.trim() || !provider || testStatus === "testing"}
                className="px-3 py-2.5 rounded-lg bg-bg border border-border text-[12px] font-medium text-text-secondary hover:text-text-primary hover:border-primary/30 transition-colors disabled:opacity-50"
              >
                {testStatus === "testing" ? "Testing..." : "Test"}
              </button>
            </div>
            {testStatus === "ok" && <p className="mt-1.5 text-[12px] text-accent-green">Connection successful</p>}
            {testStatus === "error" && <p className="mt-1.5 text-[12px] text-red-500">{testError}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-text-primary mb-1.5">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setTestStatus("idle"); setTestError(""); }}
              placeholder={selected?.placeholder || "Enter your API key"}
              required
              className="w-full max-w-[320px] px-4 py-2.5 rounded-lg bg-bg border border-border text-[13px] font-mono text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/40 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={loading || !apiKey.trim() || !provider}
              className="px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              {loading ? "Adding..." : "Add Key"}
            </button>
            {success && (
              <span className="flex items-center gap-1.5 text-[13px] text-accent-green">
                <CheckIcon className="w-4 h-4" /> Added
              </span>
            )}
          </div>
        </div>
      </form>

      {/* Connected Keys */}
      <div className="bg-surface border border-border rounded-[12px] p-6">
        <h2 className="text-[15px] font-semibold text-text-primary mb-4">Connected Keys</h2>
        {fetchingKeys ? (
          <p className="text-[13px] text-text-secondary">Loading...</p>
        ) : keys.length === 0 ? (
          <p className="text-[13px] text-text-secondary">
            No keys added yet. Add your first API key above to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => {
              const p = k.provider_detail;
              return (
                <div key={k.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-bg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${p.color || "#666"}15` }}>
                      <ProviderLogo logo_url={p.logo_url || ""} color={p.color || "#666"} label={p.label} />
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-text-primary">{p.label}</div>
                      <div className="text-[12px] font-mono text-text-secondary">{k.api_key_masked}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-green/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                      <span className="text-[11px] font-medium text-accent-green">Active</span>
                    </div>
                    <button
                      onClick={() => handleDelete(k.id)}
                      className="p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
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
