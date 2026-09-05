"use client";

import { useState } from "react";
import { api } from "@/lib/api";

function GoogleIcon() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.29a12 12 0 0 0 0 10.76l3.98-3.1z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.1C6.22 6.88 8.87 4.77 12 4.77z" />
    </svg>
  );
}

export default function GoogleButton({ onError }: { onError?: (msg: string) => void }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await api<{ data: { google: { enabled: boolean; auth_url: string | null } } }>(
        "/auth/oauth/providers/",
        {}
      );
      const google = res.data?.google;
      if (!google?.enabled || !google.auth_url) {
        onError?.("Google sign-in is not configured yet");
        return;
      }
      window.location.href = google.auth_url;
    } catch {
      onError?.("Could not start Google sign-in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full h-11 rounded-[10px] bg-surface border border-border text-[13px] font-medium text-text-primary hover:bg-bg hover:border-primary/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      {loading ? "Connecting..." : "Continue with Google"}
    </button>
  );
}
