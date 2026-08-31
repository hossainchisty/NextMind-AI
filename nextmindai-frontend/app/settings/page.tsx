"use client";

import Sidebar from "@/components/sidebar/Sidebar";
import {
  CpuIcon,
  ShieldIcon,
  CheckIcon,
  LayersIcon,
} from "@/components/ui/Icons";

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[760px] mx-auto px-8 py-10">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-[26px] font-semibold tracking-tight text-text-primary mb-2">
              Local AI
            </h1>
            <p className="text-[15px] text-text-secondary">
              Configure and monitor your local AI runtime.
            </p>
          </div>

          {/* Runtime Status */}
          <div className="bg-surface border border-border rounded-[12px] p-6 mb-6 animate-fade-in" style={{ animationDelay: "50ms" }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                  <CpuIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-text-primary">Ollama</h2>
                  <p className="text-[12px] text-text-secondary">Local AI Runtime</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/10">
                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse-dot" />
                <span className="text-[12px] font-medium text-accent-green">Running locally</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Chat Model */}
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div>
                  <div className="text-[13px] font-medium text-text-primary">Chat Model</div>
                  <div className="text-[12px] text-text-secondary">Primary language model for conversations</div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg border border-border text-[13px] font-mono text-text-primary">
                  llama3.2:latest
                </div>
              </div>

              {/* Embedding Model */}
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div>
                  <div className="text-[13px] font-medium text-text-primary">Embedding Model</div>
                  <div className="text-[12px] text-text-secondary">For document vectorization and search</div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg border border-border text-[13px] font-mono text-text-primary">
                  nomic-embed-text
                </div>
              </div>

              {/* Reranker */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-[13px] font-medium text-text-primary">Reranker</div>
                  <div className="text-[12px] text-text-secondary">For ranking retrieved document relevance</div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg border border-border text-[13px] font-mono text-text-primary">
                  Local cross-encoder
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="bg-surface border border-border rounded-[12px] p-6 mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                <ShieldIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-text-primary">Privacy & Security</h2>
                <p className="text-[12px] text-text-secondary">Your data never leaves this device</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                "All conversations processed locally",
                "Documents stored on your device only",
                "No cloud API calls required",
                "Offline-ready by default",
                "End-to-end encryption available",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-accent-green/10 flex items-center justify-center shrink-0">
                    <CheckIcon className="w-3 h-3 text-accent-green" />
                  </div>
                  <span className="text-[13px] text-text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Storage */}
          <div className="bg-surface border border-border rounded-[12px] p-6 animate-fade-in" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                <LayersIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-text-primary">Storage</h2>
                <p className="text-[12px] text-text-secondary">Local data and cache management</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-text-secondary">Knowledge base</span>
                  <span className="text-[12px] font-medium text-text-primary">17.0 MB</span>
                </div>
                <div className="w-full h-2 rounded-full bg-bg overflow-hidden">
                  <div className="h-full rounded-full bg-primary/40" style={{ width: "34%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-text-secondary">Vector embeddings</span>
                  <span className="text-[12px] font-medium text-text-primary">8.4 MB</span>
                </div>
                <div className="w-full h-2 rounded-full bg-bg overflow-hidden">
                  <div className="h-full rounded-full bg-primary/30" style={{ width: "17%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-text-secondary">Model cache</span>
                  <span className="text-[12px] font-medium text-text-primary">2.1 GB</span>
                </div>
                <div className="w-full h-2 rounded-full bg-bg overflow-hidden">
                  <div className="h-full rounded-full bg-primary/60" style={{ width: "65%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
