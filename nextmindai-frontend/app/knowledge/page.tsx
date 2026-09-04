"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import { api, apiUpload } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import {
  Search,
  Upload,
  FileText,
  Check,
  Filter,
  ChevronRight,
  ChevronDown,
  Folder,
} from "lucide-react";
import type { Document, Collection } from "@/lib/types";

type Doc = Document;

export default function KnowledgePage() {
  const { toast, confirm } = useToast();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadCollection, setUploadCollection] = useState("");

  const loadDocs = useCallback(async () => {
    try {
      const res = await api<{ data: Doc[] }>("/documents/", {});
      setDocs(res.data || []);
    } catch {
      /* empty */
    }
  }, []);

  const loadCollections = useCallback(async () => {
    try {
      const res = await api<{ data: Collection[] }>("/collections/", {});
      setCollections(res.data || []);
    } catch {
      /* empty */
    }
  }, []);

  useEffect(() => {
    loadDocs();
    loadCollections();
  }, [loadDocs, loadCollections]);

  function openUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.docx,.txt,.md";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploadFile(file);
      setUploadName(file.name);
      setUploadCollection("");
      setShowUpload(true);
    };
    input.click();
  }

  async function handleUpload() {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const extra: Record<string, string> = {};
      if (uploadName) extra.name = uploadName;
      if (uploadCollection) extra.collection = uploadCollection;
      await apiUpload("/documents/", uploadFile, extra);
      setShowUpload(false);
      setUploadFile(null);
      await loadDocs();
      toast("Document uploaded", "success");
    } catch {
      toast("Failed to upload document", "error");
    } finally {
      setUploading(false);
    }
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

  function getCollectionName(id: string): string {
    return collections.find(c => c.id === id)?.name || "";
  }

  const filterOptions = ["All", ...collections.map(c => c.name)];

  const filtered = docs.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "All" ||
      (doc.collection && getCollectionName(doc.collection) === activeFilter);
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
                <div className="absolute top-11 right-0 w-48 bg-surface border border-border rounded-[10px] shadow-lg py-1.5 z-50 animate-slide-up max-h-64 overflow-y-auto">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setActiveFilter(opt); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3.5 py-2 text-[13px] transition-colors flex items-center gap-2 ${
                        activeFilter === opt
                          ? "bg-primary/5 text-primary font-medium"
                          : "text-text-secondary hover:bg-bg hover:text-text-primary"
                      }`}
                    >
                      {opt !== "All" && <Folder className="w-3.5 h-3.5" />}
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={openUpload} disabled={uploading}>
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>

          <div className="bg-surface border border-border rounded-[12px] overflow-hidden animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="grid grid-cols-[1fr_100px_80px_120px_100px_120px_50px] gap-4 px-5 py-3 border-b border-border text-[11px] font-semibold tracking-wider text-text-secondary uppercase">
              <span>Document</span>
              <span>Type</span>
              <span>Pages</span>
              <span>Collection</span>
              <span>Status</span>
              <span>Updated</span>
              <span></span>
            </div>
            {filtered.map((doc) => (
              <div
                key={doc.id}
                className="grid grid-cols-[1fr_100px_80px_120px_100px_120px_50px] gap-4 px-5 py-3.5 border-b border-border/50 last:border-0 hover:bg-bg/50 transition-colors items-center group"
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
                <span className="text-[12px] text-text-secondary truncate">
                  {doc.collection ? getCollectionName(doc.collection) : "—"}
                </span>
                <div>
                  {doc.status === "completed" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent-green/10 text-accent-green text-[11px] font-medium">
                      <Check className="w-3 h-3" />
                      Indexed
                    </span>
                  ) : doc.status === "failed" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-medium">
                      Failed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[11px] font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                      {doc.status === "processing" ? "Processing" : "Pending"}
                    </span>
                  )}
                </div>
                <span className="text-[12px] text-text-secondary">{formatDate(doc.updated_at || doc.created_at)}</span>
                <div className="flex justify-end">
                  <button
                    onClick={(e) => { e.stopPropagation(); confirm("Delete this document permanently?", () => deleteDoc(doc.id), { confirmLabel: "Delete", type: "danger" }); }}
                    className="p-1.5 rounded-lg text-text-secondary/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete document"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
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

      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Document">
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
              File
            </label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg border border-border">
              <FileText className="w-4 h-4 text-text-secondary shrink-0" />
              <span className="text-[13px] text-text-primary truncate flex-1">{uploadFile?.name}</span>
              <span className="text-[11px] text-text-secondary shrink-0">
                {uploadFile ? formatSize(uploadFile.size) : ""}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              placeholder="Document name"
              className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-[13px] font-mono text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-2 focus:border-primary/40 focus:ring-primary/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Collection
            </label>
            <select
              value={uploadCollection}
              onChange={(e) => setUploadCollection(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-[13px] text-text-primary focus:outline-none focus:ring-2 focus:border-primary/40 focus:ring-primary/10 transition-all appearance-none"
            >
              <option value="">No collection</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="secondary" onClick={() => setShowUpload(false)}>Cancel</Button>
          <Button loading={uploading} disabled={!uploadFile} onClick={handleUpload}>
            <Upload className="w-4 h-4" />
            Upload
          </Button>
        </div>
      </Modal>
    </div>
  );
}
