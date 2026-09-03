"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import AddProviderModal from "./AddProviderModal";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { ProviderLogo, MoreIcon, TrashIcon, KeyIcon } from "@/components/ui/Icons";
import type { Provider, APIKey } from "@/lib/types";

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
          <Card className="flex flex-col items-center justify-center py-16 border-dashed">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <KeyIcon />
            </div>
            <p className="text-[14px] font-medium text-text-primary mb-1">No provider keys yet</p>
            <p className="text-[13px] text-text-secondary mb-4">Add your first provider key to get started</p>
            {unconnectedProviders.length > 0 && (
              <AddProviderModal unconnectedProviders={unconnectedProviders} onConnected={handleConnected} />
            )}
          </Card>
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
                    <Card key={p.value} hover={false}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <ProviderLogo logo_url={p.logo_url} color={p.color} label={p.label} />
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold text-text-primary">{p.label}</span>
                            <Badge variant="success" dot>Active</Badge>
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
                                <TrashIcon /> Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
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
