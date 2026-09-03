"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import { api, apiUpload } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import {
  Search,
  Upload,
  FileText,
  Check,
  Filter,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface Doc {
  id: string;
  name: string;
  file_type: string;
  page_count: number;
  file_size: number;
  status: string;
  created_at: string;
  collection: string | null;
}

function ITrash() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>); }

export default function KnowledgePage() {
  const { toast, confirm } = useToast();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadDocs = useCallback(async () => {
    try {
      const res = await api<{ data: Doc[] }>("/documents/", {});
      setDocs(res.data || []);
    } catch {
      /* empty */
    }
  }, []);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  async function handleUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.docx,.txt,.md";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        await apiUpload("/documents/", file);
        await loadDocs();
      } catch {
        /* empty */
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }

  async function deleteDoc(id: string) {
    try {
      await api(`/documents/${id}/`, { method: "DELETE" });
      setDocs((prev) => prev.filter((d) => d.id !== id));
      toast("Document deleted", "success");
    } catch {
      toast("Failed to delete document", "error");
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const filtered = docs.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "All";
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[960px] mx-auto px-8 py-10">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-[26px] font-semibold tracking-tight text-text-primary mb-2">
              My Knowledge
            </h1>
            <p className="text-[15px] text-text-secondary">
              Manage the documents NextMind can understand and search.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-6 animate-fade-in" style={{ animationDelay: "50ms" }}>
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents..."
                className="w-full h-10 pl-10 pr-4 rounded-[10px] bg-surface border border-border text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/5 transition-all"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="h-10 px-3.5 rounded-[10px] bg-surface border border-border text-[13px] text-text-secondary hover:text-text-primary hover:border-primary/20 transition-all flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {activeFilter}
                {showFilterDropdown ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
              {showFilterDropdown && (
                <div className="absolute top-11 right-0 w-44 bg-surface border border-border rounded-[10px] shadow-lg py-1.5 z-50 animate-slide-up">
                  {["All"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setActiveFilter(opt); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3.5 py-2 text-[13px] transition-colors ${activeFilter === opt ? "bg-primary/5 text-primary font-medium" : "text-text-secondary hover:bg-bg hover:text-text-primary"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="h-10 px-4 rounded-[10px] bg-primary text-white text-[13px] font-medium hover:bg-primary-light transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          <div className="bg-surface border border-border rounded-[12px] overflow-hidden animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="grid grid-cols-[1fr_100px_80px_140px_100px_50px] gap-4 px-5 py-3 border-b border-border text-[11px] font-semibold tracking-wider text-text-secondary uppercase">
              <span>Document</span>
              <span>Type</span>
              <span>Pages</span>
              <span>Updated</span>
              <span>Status</span>
              <span></span>
            </div>
            {filtered.map((doc) => (
              <div
                key={doc.id}
                className="grid grid-cols-[1fr_100px_80px_140px_100px_50px] gap-4 px-5 py-3.5 border-b border-border/50 last:border-0 hover:bg-bg/50 transition-colors items-center group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-bg border border-border flex items-center justify-center shrink-0 group-hover:border-primary/20 transition-colors">
                    <FileText className="w-4 h-4 text-text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                      {doc.name}
                    </div>
                    <div className="text-[11px] text-text-secondary">
                      {formatSize(doc.file_size)}
                    </div>
                  </div>
                </div>
                <span className="text-[12px] text-text-secondary uppercase">{doc.file_type}</span>
                <span className="text-[12px] text-text-secondary font-mono">{doc.page_count}</span>
                <span className="text-[12px] text-text-secondary">{formatDate(doc.created_at)}</span>
                <div>
                  {doc.status === "completed" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent-green/10 text-accent-green text-[11px] font-medium">
                      <Check className="w-3 h-3" />
                      Indexed
                    </span>
                  ) : doc.status === "failed" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 text-red-600 text-[11px] font-medium">
                      Failed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-50 text-yellow-600 text-[11px] font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                      {doc.status === "processing" ? "Processing" : "Pending"}
                    </span>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={(e) => { e.stopPropagation(); confirm("Delete this document permanently?", () => deleteDoc(doc.id), { confirmLabel: "Delete", type: "danger" }); }}
                    className="p-1.5 rounded-lg text-text-secondary/40 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete document"
                  >
                    <ITrash />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-5 py-16 text-center text-[14px] text-text-secondary">
                No documents found. Upload your first document to get started.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
