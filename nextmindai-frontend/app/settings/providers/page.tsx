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
  const s = size === "lg" ? "w-10 h-10" : size === "md" ? "w-9 h-9" : "w-6 h-6";
  const t = size === "lg" ? "text-[14px]" : size === "md" ? "text-[12px]" : "text-[10px]";
  if (logo_url) return <img src={logo_url} className={`${s} rounded-lg`} alt="" />;
  return <span className={`${s} rounded-lg flex items-center justify-center ${t} font-bold text-white`} style={{ backgroundColor: color }}>{label[0]}</span>;
}

function CheckIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function TrashIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>; }
function PlusIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function XIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function SearchIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [search, setSearch] = useState("");
  const [connectModal, setConnectModal] = useState<Provider | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingKeys, setFetchingKeys] = useState(true);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [testError, setTestError] = useState("");

  useEffect(() => {
    api<{ data: Provider[] }>("auth/providers").then((res) => setProviders(res.data)).catch(() => {});
    api<{ data: APIKey[] }>("auth/api-keys").then((res) => { setKeys(res.data); setFetchingKeys(false); }).catch(() => setFetchingKeys(false));
  }, []);

  const connectedMap = new Map(keys.map((k) => [k.provider_detail.value, k]));

  const filtered = providers.filter((p) =>
    p.label.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-text-primary mb-1">Connect a provider</h1>
        <p className="text-[14px] text-text-secondary">Add your own API keys to use your preferred models.</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <SearchIcon />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search providers..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-border text-[14px] text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
        />
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/40">
          <SearchIcon />
        </div>
      </div>

      {/* Provider List */}
      <div className="space-y-2">
        {filtered.map((p) => {
          const connected = connectedMap.get(p.value);
          return (
            <div
              key={p.value}
              className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:border-primary/20 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-4">
                <ProviderLogo logo_url={p.logo_url} color={p.color} label={p.label} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-text-primary">{p.label}</span>
                    {connected && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-green/10 text-accent-green flex items-center gap-1">
                        <CheckIcon /> Connected
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] font-mono text-text-secondary">{p.endpoint.replace("https://", "")}</span>
                </div>
              </div>
              {connected ? (
                <button
                  onClick={() => handleDelete(connected.id)}
                  className="p-2 rounded-lg text-text-secondary/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Remove key"
                >
                  <TrashIcon />
                </button>
              ) : (
                <button
                  onClick={() => { setConnectModal(p); setTestStatus("idle"); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-[12px] font-medium hover:bg-primary/90 transition-colors"
                >
                  <PlusIcon /> Connect
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Connect Modal */}
      {connectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-[420px] p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <ProviderLogo logo_url={connectModal.logo_url} color={connectModal.color} label={connectModal.label} size="lg" />
                <div>
                  <h2 className="text-[16px] font-semibold text-text-primary">{connectModal.label}</h2>
                  <p className="text-[12px] font-mono text-text-secondary">{connectModal.endpoint.replace("https://", "")}</p>
                </div>
              </div>
              <button onClick={() => { setConnectModal(null); setTestStatus("idle"); }} className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors">
                <XIcon />
              </button>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-2 uppercase tracking-wider">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => { setApiKey(e.target.value); setTestStatus("idle"); }}
                  placeholder={connectModal.placeholder}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-[13px] font-mono text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={!apiKey.trim() || testStatus === "testing"}
                  className="px-4 py-2.5 rounded-xl border border-border text-[12px] font-medium text-text-secondary hover:text-text-primary hover:border-primary/30 transition-colors disabled:opacity-40"
                >
                  {testStatus === "testing" ? "..." : "Test Connection"}
                </button>
                {testStatus === "ok" && <span className="flex items-center gap-1 text-[12px] text-accent-green"><CheckIcon /> Success</span>}
                {testStatus === "error" && <span className="text-[12px] text-red-500">{testError}</span>}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !apiKey.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-[13px] font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
                >
                  {loading ? "Connecting..." : "Connect"}
                </button>
                <button type="button" onClick={() => { setConnectModal(null); setTestStatus("idle"); }} className="px-4 py-2.5 rounded-xl text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
