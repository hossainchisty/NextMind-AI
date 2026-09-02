"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import { api } from "@/lib/api";
import { TrashIcon, CheckIcon } from "@/components/ui/Icons";

interface Provider {
  id: string;
  value: string;
  label: string;
  endpoint: string;
  placeholder: string;
  logo: string;
  color: string;
}

interface APIKey {
  id: string;
  provider: Provider;
  provider_detail: Provider;
  label: string;
  api_key: string;
  api_key_masked: string;
  is_active: boolean;
  created_at: string;
}

function ProviderLogo({ logo, color, className }: { logo: string; color: string; className?: string }) {
  const logos: Record<string, React.ReactNode> = {
    openai: (
      <svg className={className} viewBox="0 0 24 24" fill={color}>
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
      </svg>
    ),
    anthropic: (
      <svg className={className} viewBox="0 0 24 24" fill={color}>
        <path d="M13.827 3.52h3.603L24 20.48h-3.603l-6.57-16.96zm-7.258 0h3.767L16.906 20.48h-3.674l-1.632-4.317h-6.46l-1.59 4.317H0L6.57 3.52zm1.08 5.412l-2.164 5.644h4.344l-2.18-5.644z" />
      </svg>
    ),
    gemini: (
      <svg className={className} viewBox="0 0 24 24" fill={color}>
        <path d="M12 24A14.304 14.304 0 0 0 0 12 14.304 14.304 0 0 0 12 0a14.304 14.304 0 0 0 0 24zm0-4.8a9.504 9.504 0 0 1-9.504-9.504A9.504 9.504 0 0 1 12 7.2 9.504 9.504 0 0 1 21.504 12 9.504 9.504 0 0 1 12 19.2z" />
        <circle cx="12" cy="12" r="3.6" />
      </svg>
    ),
    openrouter: (
      <svg className={className} viewBox="0 0 24 24" fill={color}>
        <path d="M5.4 18.6L3.6 15h3l.6 1.8L9.6 15h3l-4.2 12h-3zm4.8-14.4l-3 7.2h3l.6-1.8h3.6l.6 1.8h3l-3-7.2h-4.8zm1.2 4.2l1.2-3 1.2 3h-2.4z" />
      </svg>
    ),
    deepseek: (
      <svg className={className} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
      </svg>
    ),
    xai: (
      <svg className={className} viewBox="0 0 24 24" fill={color}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    mistral: (
      <svg className={className} viewBox="0 0 24 24" fill={color}>
        <path d="M3 3h4v4H3V3zm7 0h4v4h-4V3zm7 0h4v4h-4V3zM3 10h4v4H3v-4zm7 0h4v4h-4v-4zm7 0h4v4h-4v-4zM3 17h4v4H3v-4zm7 0h4v4h-4v-4zm7 0h4v4h-4v-4z" />
      </svg>
    ),
    nvidia: (
      <svg className={className} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    fireworks: (
      <svg className={className} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    opencode: (
      <svg className={className} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  };
  return logos[logo] || <span className={`text-[13px] font-bold`} style={{ color }}>{logo[0].toUpperCase()}</span>;
}

export default function SettingsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [provider, setProvider] = useState("");
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

  async function fetchProviders() {
    try {
      const res = await api<{ data: Provider[] }>("auth/providers");
      setProviders(res.data);
    } catch {
      // ignore
    } finally {
      setFetchingProviders(false);
    }
  }

  async function fetchKeys() {
    try {
      const res = await api<{ data: APIKey[] }>("auth/api-keys");
      setKeys(res.data);
    } catch {
      // ignore
    } finally {
      setFetchingKeys(false);
    }
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
      const msg = err?.detail || err?.provider?.[0] || "Failed to save API key";
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
    } catch {
      alert("Failed to delete");
    }
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
      setTestError(err?.detail || "Connection failed");
    }
  }

  const selected = providers.find((p) => p.value === provider);

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[760px] mx-auto px-8 py-10">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-[26px] font-semibold tracking-tight text-text-primary mb-2">
              API Models
            </h1>
            <p className="text-[15px] text-text-secondary">
              Connect a cloud provider (OpenAI, Anthropic, DeepSeek, OpenRouter, etc.).
            </p>
          </div>

          {/* Add Key Form */}
          <form
            onSubmit={handleAdd}
            className="bg-surface border border-border rounded-[12px] p-6 mb-6 animate-fade-in"
            style={{ animationDelay: "50ms" }}
          >
            <div className="space-y-4">
              {/* Provider Select */}
              <div>
                <label className="block text-[13px] font-medium text-text-primary mb-1.5">
                  Endpoint
                </label>
                <div className="relative">
                  <select
                    value={provider}
                    onChange={(e) => {
                      setProvider(e.target.value);
                      setTestStatus("idle");
                      setTestError("");
                    }}
                    className="w-full appearance-none px-4 py-2.5 pr-10 rounded-lg bg-bg border border-border text-[13px] text-text-primary focus:outline-none focus:border-primary/40 transition-colors cursor-pointer"
                  >
                    <option value="">Select a provider</option>
                    {providers.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Endpoint URL */}
              <div>
                <label className="block text-[13px] font-medium text-text-primary mb-1.5">
                  Base URL
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-2.5 rounded-lg bg-bg border border-border text-[13px] font-mono text-text-secondary">
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
                {testStatus === "ok" && (
                  <p className="mt-1.5 text-[12px] text-accent-green">Connection successful</p>
                )}
                {testStatus === "error" && (
                  <p className="mt-1.5 text-[12px] text-red-500">{testError}</p>
                )}
              </div>

              {/* API Key */}
              <div>
                <label className="block text-[13px] font-medium text-text-primary mb-1.5">
                  API key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestStatus("idle");
                    setTestError("");
                  }}
                  placeholder={selected?.placeholder}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-bg border border-border text-[13px] font-mono text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading || !apiKey.trim() || !provider}
                  className="px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  {loading ? "Adding..." : "Add"}
                </button>
                {success && (
                  <span className="flex items-center gap-1.5 text-[13px] text-accent-green">
                    <CheckIcon className="w-4 h-4" /> Added
                  </span>
                )}
              </div>
            </div>
          </form>

          {/* Connected Providers */}
          <div
            className="bg-surface border border-border rounded-[12px] p-6 animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            <h2 className="text-[15px] font-semibold text-text-primary mb-4">
              Connected
            </h2>
            {fetchingKeys ? (
              <p className="text-[13px] text-text-secondary">Loading...</p>
            ) : keys.length === 0 ? (
              <p className="text-[13px] text-text-secondary">
                No providers connected yet.
              </p>
            ) : (
              <div className="space-y-3">
                {keys.map((k) => {
                  const p = k.provider_detail || k.provider;
                  return (
                    <div
                      key={k.id}
                      className="flex items-center justify-between py-3 px-4 rounded-lg bg-bg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${p.color || "#666"}10` }}
                        >
                          <ProviderLogo logo={p.logo || ""} color={p.color || "#666"} className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[13px] font-medium text-text-primary">
                            {p.label || k.provider.value}
                            {k.label && (
                              <span className="ml-2 text-text-secondary">— {k.label}</span>
                            )}
                          </div>
                          <div className="text-[12px] font-mono text-text-secondary">
                            {k.api_key_masked}
                          </div>
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
      </main>
    </div>
  );
}
