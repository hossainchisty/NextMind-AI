"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import AddProviderModal from "./AddProviderModal";

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

function MoreIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>; }
function TrashIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>; }
function KeyIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>; }

export default function ProvidersPage() {
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [fetchingKeys, setFetchingKeys] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    api<{ data: Provider[] }>("auth/providers").then((res) => setProviders(res.data)).catch(() => {});
    api<{ data: APIKey[] }>("auth/api-keys").then((res) => { setKeys(res.data); setFetchingKeys(false); }).catch(() => setFetchingKeys(false));
  }, []);

  const connectedMap = new Map(keys.map((k) => [k.provider_detail.value, k]));
  const connectedProviders = providers.filter((p) => connectedMap.has(p.value));
  const unconnectedProviders = providers.filter((p) => !connectedMap.has(p.value));

  function handleConnected(newKey: APIKey) {
    setKeys((prev) => [newKey, ...prev]);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this key?")) return;
    try {
      await api(`auth/api-keys/${id}`, { method: "DELETE" });
      setKeys((prev) => prev.filter((k) => k.id !== id));
      setMenuOpen(null);
      toast("Provider key removed", "success");
    } catch {
      toast("Failed to remove key", "error");
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-text-primary mb-1">Provider Keys</h1>
            <p className="text-[14px] text-text-secondary">Securely manage and monitor your API keys</p>
          </div>
          <AddProviderModal unconnectedProviders={unconnectedProviders} onConnected={handleConnected} />
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
              <AddProviderModal unconnectedProviders={unconnectedProviders} onConnected={handleConnected} />
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
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold text-text-primary">{p.label}</span>
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-green/10 text-accent-green">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                              Active
                            </span>
                            <span className="text-[12px] font-mono text-text-secondary">{k.api_key_masked}</span>
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
              <AddProviderModal
                key={p.value}
                unconnectedProviders={unconnectedProviders}
                onConnected={handleConnected}
                initialProvider={p}
                variant="grid"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
