"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { HardDrive, FileText, ArrowUpRight } from "lucide-react";

interface BreakdownRow {
  file_type: string;
  bytes: number;
  count: number;
}

interface StorageData {
  used_bytes: number;
  quota_bytes: number;
  percent: number;
  document_count: number;
  breakdown: BreakdownRow[];
}

const TYPE_STYLES: Record<string, string> = {
  pdf: "bg-red-500/10 text-red-500",
  docx: "bg-blue-500/10 text-blue-500",
  txt: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
  csv: "bg-green-500/10 text-green-600 dark:text-green-400",
  md: "bg-purple-500/10 text-purple-500",
  xlsx: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  json: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  html: "bg-orange-500/10 text-orange-500",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

function barColor(percent: number): string {
  if (percent >= 90) return "bg-red-500";
  if (percent >= 70) return "bg-amber-500";
  return "bg-accent-green";
}

export default function StoragePage() {
  const [data, setData] = useState<StorageData | null>(null);

  useEffect(() => {
    api<{ data: StorageData }>("auth/me/storage/").then((res) => {
      setData(res.data);
    }).catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-text-primary mb-1">Storage</h1>
        <p className="text-[14px] text-text-secondary">See how your workspace storage is used.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[15px] font-semibold text-text-primary truncate">
                  {data ? formatSize(data.used_bytes) : "—"}
                  <span className="font-normal text-text-secondary"> of {data ? formatSize(data.quota_bytes) : "—"} used</span>
                </p>
                <span className="text-[13px] font-mono text-text-secondary shrink-0">
                  {data ? `${data.percent}%` : ""}
                </span>
              </div>
              <div className="h-2.5 mt-2.5 rounded-full bg-bg overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor(data?.percent || 0)}`}
                  style={{ width: `${Math.min(data?.percent || 0, 100)}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-[13px] text-text-secondary">
            <span><strong className="text-text-primary font-semibold">{data?.document_count ?? "—"}</strong> documents</span>
            <span><strong className="text-text-primary font-semibold">{data?.breakdown.length ?? "—"}</strong> file types</span>
            <span>Up to 100 MB per file</span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Usage by file type
          </h2>
          {!data ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 rounded-xl bg-bg animate-pulse" />
              ))}
            </div>
          ) : data.breakdown.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 mx-auto mb-3 text-text-secondary/40" />
              <p className="text-[14px] font-medium text-text-primary mb-1">No files yet</p>
              <p className="text-[13px] text-text-secondary mb-4">Upload documents to start using storage.</p>
              <Link
                href="/knowledge"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline underline-offset-2"
              >
                Go to My Knowledge <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.breakdown.map((row) => {
                const pct = data.used_bytes ? (row.bytes / data.used_bytes) * 100 : 0;
                return (
                  <div key={row.file_type} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${TYPE_STYLES[row.file_type] || "bg-bg text-text-secondary"}`}>
                      <span className="text-[9px] font-bold">{row.file_type.slice(0, 4).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span className="text-[13px] font-medium text-text-primary uppercase">
                          {row.file_type}
                          <span className="ml-2 font-normal text-text-secondary normal-case">
                            {row.count} file{row.count === 1 ? "" : "s"}
                          </span>
                        </span>
                        <span className="text-[12px] text-text-secondary shrink-0">
                          {formatSize(row.bytes)} · {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-bg overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/60 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
