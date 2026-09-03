"use client";

import { useState, useRef } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useClickOutside } from "@/hooks/useClickOutside";
import { ProviderLogo } from "@/components/ui/Icons";
import { ChevronDown } from "lucide-react";
import { Plus } from "lucide-react";
import type { Provider, APIKey } from "@/lib/types";

interface Props {
  unconnectedProviders: Provider[];
  onConnected: (key: APIKey) => void;
  initialProvider?: Provider | null;
  variant?: "button" | "grid";
}

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

  useClickOutside(dropdownRef, () => setShowDropdown(false));

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
        <Button onClick={() => handleOpen()}>
          <Plus className="w-4 h-4" />
          Add provider key
        </Button>
      )}

      <Modal open={open} onClose={handleClose} title="Add provider key">
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
          <Input
            label="API Key"
            type="password"
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setTestStatus("idle"); }}
            placeholder={selectedProvider?.placeholder || "Enter your API key"}
            required
            autoFocus
            hint={`Find your key in the ${selectedProvider?.label || "provider"} dashboard.`}
          />

          {/* Error */}
          {testStatus === "error" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
              <span className="text-[12px] text-red-600">{testError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading || testStatus === "testing"}
              disabled={!apiKey.trim()}
              className="flex-1"
            >
              {testStatus === "ok" ? "Connected" : testStatus === "testing" ? "Testing..." : loading ? "Saving..." : "Connect"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
