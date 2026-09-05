"use client";

import { useState, useEffect, useCallback } from "react";
import { Database, Layers, HardDrive, RefreshCw } from "lucide-react";
import SitePage from "@/components/landing/SitePage";
import { api } from "@/lib/api";

interface ComponentHealth {
  status: "operational" | "down";
  latency_ms: number;
}

interface HealthData {
  status: "operational" | "degraded";
  components: Record<string, ComponentHealth>;
  checked_at: string;
}

const META: Record<string, { label: string; body: string; icon: typeof Database }> = {
  database: { label: "Database", body: "Accounts, documents, and index metadata.", icon: Database },
  queue: { label: "Task queue", body: "Document processing jobs.", icon: Layers },
  storage: { label: "File storage", body: "Private document object store.", icon: HardDrive },
};

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

export default function StatusPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [failed, setFailed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [, tick] = useState(0);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const res = await api<{ data: HealthData }>("/health/", {});
      setData(res.data);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [check]);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const overall = failed ? "unreachable" : data?.status || "checking";

  return (
    <SitePage>
      <section className="pt-36 pb-10">
        <div className="mx-auto max-w-[760px] px-5">
          <p className="text-[12px] font-semibold tracking-[0.2em] text-[#2A7D5F] uppercase mb-3">
            Status
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-[36px] md:text-[44px] font-semibold tracking-tight text-[#0D2B22]">
              System status
            </h1>
            <button
              onClick={check}
              disabled={checking}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-[#0D2B22]/15 text-[13px] font-medium text-[#0D2B22] hover:bg-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
              {checking ? "Checking..." : "Refresh"}
            </button>
          </div>
          <div
            className={`flex items-center gap-3 mt-6 rounded-2xl border px-5 py-4 ${
              overall === "operational"
                ? "border-[#2A7D5F]/30 bg-[#2A7D5F]/5"
                : "border-amber-500/30 bg-amber-500/5"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                overall === "operational" ? "bg-[#2A7D5F] animate-pulse-dot" : "bg-amber-500"
              }`}
            />
            <p className="text-[14px] text-[#0D2B22]/80">
              {overall === "operational" && "All systems operational."}
              {overall === "degraded" && "Some systems are experiencing issues."}
              {overall === "checking" && "Checking systems..."}
              {overall === "unreachable" && "Status check unreachable. The app itself may still be fine — try refreshing."}
            </p>
            {data && (
              <span className="ml-auto text-[12px] text-[#0D2B22]/50 shrink-0">
                checked {timeAgo(data.checked_at)}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-[760px] px-5 space-y-3">
          {Object.entries(META).map(([key, meta]) => {
            const comp = data?.components[key];
            const ok = comp?.status === "operational";
            const Icon = meta.icon;
            return (
              <div
                key={key}
                className="rounded-2xl border border-[#0D2B22]/10 bg-white/70 backdrop-blur-xl p-5 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0D2B22] text-[#D4F53C] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-[#0D2B22]">{meta.label}</h3>
                  <p className="text-[13px] text-[#0D2B22]/60">{meta.body}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[13px] font-semibold ${!data || failed ? "text-[#0D2B22]/40" : ok ? "text-[#2A7D5F]" : "text-red-500"}`}>
                    {!data || failed ? "Unknown" : ok ? "Operational" : "Down"}
                  </p>
                  {comp && data && !failed && (
                    <p className="text-[11px] text-[#0D2B22]/50 font-mono">{comp.latency_ms}ms</p>
                  )}
                </div>
              </div>
            );
          })}
          <p className="text-[12px] text-[#0D2B22]/50 pt-2">
            Checks run live against the database, task queue, and file storage every 30 seconds. Past incidents are posted here.
          </p>
        </div>
      </section>
    </SitePage>
  );
}
