"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import { api, apiUpload, apiReupload } from "@/lib/api";
import {
  UPLOAD_ACCEPT,
  UPLOAD_LIMITS_TEXT,
  SUPPORTED_TYPES_LABEL,
  MAX_BATCH_SIZE,
  validateFiles,
  type FileIssue,
} from "@/lib/uploads";
import { useToast } from "@/components/ui/Toast";
import { useClickOutside } from "@/hooks/useClickOutside";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import {
  Search,
  Upload,
  Check,
  Filter,
  ChevronDown,
  Folder,
  RefreshCw,
  X,
  Plus,
  FileStack,
  CircleCheck,
  Loader,
  TriangleAlert,
  Trash2,
} from "lucide-react";
import type { Document, Collection } from "@/lib/types";

type Doc = Document;
type StatusFilter = "all" | "indexed" | "active" | "failed";
type SortKey = "newest" | "oldest" | "name" | "size";

interface BatchUploadData {
  documents: Doc[];
  errors: FileIssue[];
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

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
  { value: "size", label: "Largest first" },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "indexed", label: "Indexed" },
  { value: "active", label: "In progress" },
  { value: "failed", label: "Failed" },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function KnowledgePage() {
  const { toast, confirm } = useToast();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [search, setSearch] = useState("");
  const [activeCollection, setActiveCollection] = useState("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [showFiltersMenu, setShowFiltersMenu] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCollection, setBulkCollection] = useState("");
  const [bulkWorking, setBulkWorking] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadName, setUploadName] = useState("");
  const [uploadCollection, setUploadCollection] = useState("");
  const [uploadIssues, setUploadIssues] = useState<FileIssue[]>([]);
  const [serverErrors, setServerErrors] = useState<FileIssue[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [pageDragOver, setPageDragOver] = useState(false);
  const dragDepth = useRef(0);

  const collectionMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(collectionMenuRef, () => setShowFiltersMenu(false));

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

  const stats = useMemo(() => {
    const indexed = docs.filter((d) => d.status === "completed").length;
    const active = docs.filter((d) => d.status === "pending" || d.status === "processing").length;
    const failed = docs.filter((d) => d.status === "failed").length;
    const bytes = docs.reduce((sum, d) => sum + (d.file_size || 0), 0);
    return { total: docs.length, indexed, active, failed, bytes };
  }, [docs]);

  function getCollectionName(id: string): string {
    return collections.find((c) => c.id === id)?.name || "";
  }

  const collectionOptions = ["All", ...collections.map((c) => c.name)];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = docs.filter((doc) => {
      if (q && !doc.name.toLowerCase().includes(q)) return false;
      if (activeCollection !== "All") {
        if (!doc.collection || getCollectionName(doc.collection) !== activeCollection) return false;
      }
      if (statusFilter === "indexed" && doc.status !== "completed") return false;
      if (statusFilter === "active" && !(doc.status === "pending" || doc.status === "processing")) return false;
      if (statusFilter === "failed" && doc.status !== "failed") return false;
      return true;
    });
    const by: Record<SortKey, (a: Doc, b: Doc) => number> = {
      newest: (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
      oldest: (a, b) => +new Date(a.created_at) - +new Date(b.created_at),
      name: (a, b) => a.name.localeCompare(b.name),
      size: (a, b) => (b.file_size || 0) - (a.file_size || 0),
    };
    return [...list].sort(by[sort]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs, search, activeCollection, statusFilter, sort, collections]);

  const allVisibleSelected = filtered.length > 0 && filtered.every((d) => selected.has(d.id));

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((d) => next.delete(d.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((d) => next.add(d.id));
        return next;
      });
    }
  }

  function clearFilters() {
    setSearch("");
    setActiveCollection("All");
    setStatusFilter("all");
  }

  const hasActiveFilters = search.trim() !== "" || activeCollection !== "All" || statusFilter !== "all";

  const activeFilterCount =
    (activeCollection !== "All" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  // ---------- upload ----------

  function addFiles(files: File[]) {
    if (!files.length) return;
    const merged = [...uploadFiles, ...files].slice(0, MAX_BATCH_SIZE + 1);
    setUploadFiles(merged);
    setUploadName(merged.length === 1 ? merged[0].name : "");
    setUploadIssues(validateFiles(merged));
    setServerErrors([]);
  }

  function openUpload() {
    setUploadFiles([]);
    setUploadName("");
    setUploadCollection("");
    setUploadIssues([]);
    setServerErrors([]);
    setShowUpload(true);
  }

  function browseFiles() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = UPLOAD_ACCEPT;
    input.multiple = true;
    input.onchange = () => addFiles(Array.from(input.files || []));
    input.click();
  }

  function removeUploadFile(index: number) {
    setUploadFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setUploadIssues(validateFiles(next));
      if (next.length === 1) setUploadName(next[0].name);
      return next;
    });
  }

  function closeUpload() {
    if (uploading) return;
    setShowUpload(false);
    setUploadFiles([]);
    setUploadIssues([]);
    setServerErrors([]);
  }

  function uploadErrorFor(filename: string): string | undefined {
    return (
      uploadIssues.find((i) => i.filename === filename)?.error ||
      serverErrors.find((e) => e.filename === filename)?.error
    );
  }

  async function handleUpload() {
    if (!uploadFiles.length || uploading) return;
    const issues = validateFiles(uploadFiles);
    setUploadIssues(issues);
    if (issues.some((i) => !i.filename)) return; // blocking batch-level issue
    const validFiles = uploadFiles.filter(
      (f) => !issues.some((i) => i.filename === f.name)
    );
    if (!validFiles.length) return;
    setUploading(true);
    setServerErrors([]);
    try {
      const extra: Record<string, string> = {};
      if (uploadCollection) extra.collection = uploadCollection;
      if (validFiles.length === 1 && uploadName.trim() && uploadName.trim() !== validFiles[0].name) {
        extra.name = uploadName.trim();
      }
      const res = (await apiUpload("/documents/", validFiles, extra)) as {
        data: BatchUploadData;
      };
      const uploadedDocs = res.data?.documents || [];
      const errs = res.data?.errors || [];
      setServerErrors(errs);
      await loadDocs();
      if (uploadedDocs.length > 0 && errs.length === 0) {
        closeUpload();
        toast(
          uploadedDocs.length === 1 ? "Document uploaded" : `${uploadedDocs.length} documents uploaded`,
          "success"
        );
      } else if (uploadedDocs.length > 0) {
        toast(`Uploaded ${uploadedDocs.length} of ${validFiles.length} documents`, "success");
      } else {
        toast("Upload failed", "error");
      }
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to upload documents";
      toast(msg, "error");
    } finally {
      setUploading(false);
    }
  }

  // ---------- per-document actions ----------

  function openReupload(id: string) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = UPLOAD_ACCEPT;
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) handleReupload(id, file);
    };
    input.click();
  }

  async function handleReupload(id: string, file: File) {
    const issues = validateFiles([file]).filter((i) => i.filename);
    if (issues.length) {
      toast(issues[0].error, "error");
      return;
    }
    try {
      await apiReupload(`/documents/${id}/`, file);
      await loadDocs();
      toast("Document re-uploaded. It will be reprocessed.", "success");
    } catch {
      toast("Failed to re-upload document", "error");
    }
  }

  async function deleteDoc(id: string) {
    try {
      await api(`/documents/${id}/`, { method: "DELETE" });
      setDocs((prev) => prev.filter((d) => d.id !== id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast("Document deleted", "success");
    } catch {
      toast("Failed to delete document", "error");
    }
  }

  async function handleBulkDelete() {
    const ids = [...selected];
    if (!ids.length) return;
    confirm(`Delete ${ids.length} document${ids.length > 1 ? "s" : ""} permanently?`, async () => {
      setBulkWorking(true);
      try {
        const results = await Promise.allSettled(
          ids.map((id) => api(`/documents/${id}/`, { method: "DELETE" }))
        );
        const ok = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.length - ok;
        setDocs((prev) => prev.filter((d) => !selected.has(d.id)));
        setSelected(new Set());
        if (failed === 0) toast(`${ok} document${ok > 1 ? "s" : ""} deleted`, "success");
        else toast(`Deleted ${ok}, failed ${failed}`, "error");
      } finally {
        setBulkWorking(false);
      }
    }, { confirmLabel: "Delete", type: "danger" });
  }

  async function handleBulkAssign() {
    const ids = [...selected];
    if (!ids.length || !bulkCollection) return;
    setBulkWorking(true);
    try {
      const results = await Promise.allSettled(
        ids.map((id) => api(`/documents/${id}/`, { method: "PATCH", json: { collection: bulkCollection } }))
      );
      const ok = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.length - ok;
      await loadDocs();
      setSelected(new Set());
      setBulkCollection("");
      if (failed === 0) toast(`${ok} document${ok > 1 ? "s" : ""} moved to collection`, "success");
      else toast(`Moved ${ok}, failed ${failed}`, "error");
    } finally {
      setBulkWorking(false);
    }
  }

  const statCards: { label: string; value: string; icon: typeof FileStack; filter: StatusFilter; active: boolean }[] = [
    { label: "Documents", value: String(stats.total), icon: FileStack, filter: "all", active: statusFilter === "all" },
    { label: "Indexed", value: String(stats.indexed), icon: CircleCheck, filter: "indexed", active: statusFilter === "indexed" },
    { label: "In progress", value: String(stats.active), icon: Loader, filter: "active", active: statusFilter === "active" },
    { label: "Failed", value: String(stats.failed), icon: TriangleAlert, filter: "failed", active: statusFilter === "failed" },
  ];

  return (
    <div
      className="flex h-screen bg-bg overflow-hidden"
      onDragEnter={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        dragDepth.current += 1;
        setPageDragOver(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setPageDragOver(false);
      }}
      onDrop={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        dragDepth.current = 0;
        setPageDragOver(false);
        if (showUpload) return; // modal dropzone handles it
        const files = Array.from(e.dataTransfer.files || []);
        if (!files.length) return;
        setUploadFiles([]);
        setUploadName("");
        setUploadCollection("");
        setUploadIssues([]);
        setServerErrors([]);
        addFiles(files);
        setShowUpload(true);
      }}
    >
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[960px] mx-auto px-8 py-10">
          <div className="mb-6 animate-fade-in">
            <h1 className="text-[26px] font-semibold tracking-tight text-text-primary mb-2">
              My Knowledge
            </h1>
            <p className="text-[15px] text-text-secondary">
              Manage the documents NextMind can understand and search.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6 animate-fade-in" style={{ animationDelay: "25ms" }}>
            {statCards.map(({ label, value, icon: Icon, filter, active }) => (
              <button
                key={label}
                onClick={() => setStatusFilter(filter)}
                title={filter === "all" ? "Show all documents" : `Show ${label.toLowerCase()} documents`}
                className={`flex items-center gap-3 px-4 py-3 rounded-[12px] border text-left transition-all ${
                  active
                    ? "bg-surface border-primary/40 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
                    : "bg-surface border-border hover:border-primary/20"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-primary/10 text-primary" : "bg-bg text-text-secondary"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[18px] font-semibold text-text-primary leading-tight">{value}</div>
                  <div className="text-[11px] text-text-secondary">{label}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="relative z-30 flex items-center gap-3 mb-3 animate-fade-in" style={{ animationDelay: "50ms" }}>
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents..."
                className="w-full h-10 pl-10 pr-9 rounded-[10px] bg-surface border border-border text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/5 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-text-secondary/50 hover:text-text-primary hover:bg-bg transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="relative shrink-0" ref={collectionMenuRef}>
              <button
                onClick={() => setShowFiltersMenu(!showFiltersMenu)}
                className="h-10 px-3.5 rounded-[10px] bg-surface border border-border text-[13px] text-text-secondary hover:text-text-primary hover:border-primary/20 transition-all flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={`w-3 h-3 transition-transform ${showFiltersMenu ? "rotate-180" : ""}`} />
              </button>
              {showFiltersMenu && (
                <div className="absolute top-11 right-0 w-60 bg-surface border border-border rounded-[12px] shadow-xl z-50 animate-slide-up overflow-hidden">
                  <div className="max-h-[50vh] overflow-y-auto py-2">
                    <p className="px-4 pt-1.5 pb-1 text-[10px] font-semibold tracking-wider text-text-secondary uppercase">
                      Collection
                    </p>
                    {collectionOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setActiveCollection(opt)}
                        className={`w-full text-left pl-4 pr-3 py-2 text-[13px] transition-colors flex items-center gap-2 ${
                          activeCollection === opt
                            ? "text-primary font-medium"
                            : "text-text-secondary hover:bg-bg hover:text-text-primary"
                        }`}
                      >
                        {opt !== "All" && <Folder className="w-3.5 h-3.5 shrink-0" />}
                        <span className="truncate flex-1">{opt}</span>
                        {activeCollection === opt && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                    <div className="mx-4 my-2 h-px bg-border" />
                    <p className="px-4 pt-1 pb-1 text-[10px] font-semibold tracking-wider text-text-secondary uppercase">
                      Status
                    </p>
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setStatusFilter(opt.value)}
                        className={`w-full text-left pl-4 pr-3 py-2 text-[13px] transition-colors flex items-center gap-2 ${
                          statusFilter === opt.value
                            ? "text-primary font-medium"
                            : "text-text-secondary hover:bg-bg hover:text-text-primary"
                        }`}
                      >
                        <span className="truncate flex-1">{opt.label}</span>
                        {statusFilter === opt.value && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                    <div className="mx-4 my-2 h-px bg-border" />
                    <p className="px-4 pt-1 pb-1 text-[10px] font-semibold tracking-wider text-text-secondary uppercase">
                      Sort by
                    </p>
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSort(opt.value)}
                        className={`w-full text-left pl-4 pr-3 py-2 text-[13px] transition-colors flex items-center gap-2 ${
                          sort === opt.value
                            ? "text-primary font-medium"
                            : "text-text-secondary hover:bg-bg hover:text-text-primary"
                        }`}
                      >
                        <span className="truncate flex-1">{opt.label}</span>
                        {sort === opt.value && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2.5 border-t border-border text-[12px] font-medium text-text-secondary hover:text-red-500 transition-colors"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </div>
            <Button onClick={openUpload} disabled={uploading}>
              {uploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  New Knowledge Base
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-end mb-4 animate-fade-in" style={{ animationDelay: "75ms" }}>
            <p className="text-[12px] text-text-secondary shrink-0 ml-4">
              {filtered.length} of {docs.length} · {formatSize(stats.bytes)} used
            </p>
          </div>

          {/* Bulk actions */}
          {selected.size > 0 && (
            <div className="flex items-center gap-3 mb-4 px-4 py-2.5 rounded-[12px] bg-surface border border-primary/30 shadow-[0_2px_12px_rgba(0,0,0,0.05)] animate-slide-up">
              <span className="text-[13px] font-medium text-text-primary shrink-0">
                {selected.size} selected
              </span>
              <select
                value={bulkCollection}
                onChange={(e) => setBulkCollection(e.target.value)}
                className="h-9 px-3 rounded-lg bg-bg border border-border text-[13px] text-text-primary focus:outline-none focus:border-primary/40 appearance-none"
              >
                <option value="">Move to collection…</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <Button size="sm" variant="secondary" disabled={!bulkCollection || bulkWorking} onClick={handleBulkAssign}>
                Apply
              </Button>
              <Button size="sm" variant="ghost" disabled={bulkWorking} onClick={handleBulkDelete}>
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
              <button
                onClick={() => { setSelected(new Set()); setBulkCollection(""); }}
                className="ml-auto text-[12px] text-text-secondary hover:text-text-primary transition-colors shrink-0"
              >
                Clear
              </button>
            </div>
          )}

          <div className="bg-surface border border-border rounded-[12px] overflow-hidden animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="grid grid-cols-[28px_1fr_100px_80px_120px_100px_120px_84px] gap-4 px-5 py-3 border-b border-border text-[11px] font-semibold tracking-wider text-text-secondary uppercase">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                ref={(el) => { if (el) el.indeterminate = !allVisibleSelected && filtered.some((d) => selected.has(d.id)); }}
                onChange={toggleSelectAll}
                className="w-3.5 h-3.5 mt-0.5 accent-primary cursor-pointer"
                title={allVisibleSelected ? "Deselect all" : "Select all"}
              />
              <span>Document</span>
              <span>Type</span>
              <span>Pages</span>
              <span>Collection</span>
              <span>Status</span>
              <span>Updated</span>
              <span className="text-right">Actions</span>
            </div>
            {filtered.map((doc) => (
              <div
                key={doc.id}
                className={`grid grid-cols-[28px_1fr_100px_80px_120px_100px_120px_84px] gap-4 px-5 py-3.5 border-b border-border/50 last:border-0 hover:bg-bg/50 transition-colors items-center group ${selected.has(doc.id) ? "bg-primary/[0.03]" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(doc.id)}
                  onChange={() => toggleSelect(doc.id)}
                  className="w-3.5 h-3.5 mt-1 accent-primary cursor-pointer"
                />
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${TYPE_STYLES[doc.file_type] || "bg-bg text-text-secondary"}`}>
                    <span className="text-[9px] font-bold tracking-wide">{doc.file_type.slice(0, 4).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                      {doc.name}
                    </div>
                    <div className="text-[11px] text-text-secondary">
                      {formatSize(doc.file_size)}
                    </div>
                    {doc.status === "failed" && doc.error_message && (
                      <div className="text-[11px] text-red-500/80 line-clamp-1" title={doc.error_message}>
                        {doc.error_message}
                      </div>
                    )}
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
                <div className="flex justify-end gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); openReupload(doc.id); }}
                    className="p-1.5 rounded-lg text-text-secondary/60 hover:text-primary hover:bg-primary/10 transition-all"
                    title="Re-upload file (use when the source file changes)"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); confirm("Delete this document permanently?", () => deleteDoc(doc.id), { confirmLabel: "Delete", type: "danger" }); }}
                    className="p-1.5 rounded-lg text-text-secondary/60 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-5 py-16 text-center">
                {docs.length === 0 ? (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-bg border border-border flex items-center justify-center mx-auto mb-4">
                      <FileStack className="w-5 h-5 text-text-secondary" />
                    </div>
                    <p className="text-[14px] font-medium text-text-primary mb-1">No documents yet</p>
                    <p className="text-[13px] text-text-secondary mb-5">Upload your first document to start building knowledge.</p>
                    <Button onClick={openUpload}>
                      <Upload className="w-4 h-4" /> Upload documents
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-[14px] font-medium text-text-primary mb-1">No matches</p>
                    <p className="text-[13px] text-text-secondary mb-5">Try a different search or clear your filters.</p>
                    {hasActiveFilters && (
                      <Button variant="secondary" onClick={clearFilters}>Clear filters</Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </main>

      {pageDragOver && (
        <div className="fixed inset-0 z-[90] bg-bg/80 backdrop-blur-sm flex items-center justify-center pointer-events-none p-8">
          <div className="w-full max-w-[560px] px-6 py-16 rounded-2xl border-2 border-dashed border-primary/60 bg-surface text-center shadow-xl">
            <Upload className="w-8 h-8 mx-auto mb-3 text-primary" />
            <p className="text-[16px] font-semibold text-text-primary mb-1">Drop files to upload</p>
            <p className="text-[12px] text-text-secondary">
              {SUPPORTED_TYPES_LABEL} · up to 100 MB each · up to {MAX_BATCH_SIZE} files
            </p>
          </div>
        </div>
      )}

      <Modal open={showUpload} onClose={closeUpload} title={`Upload Documents${uploadFiles.length > 1 ? ` (${uploadFiles.length})` : ""}`}>
        <div className="px-6 py-5 space-y-4">
          {uploadIssues.some((i) => !i.filename) && (
            <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[12px]">
              {uploadIssues.find((i) => !i.filename)?.error}
            </div>
          )}
          <div
            onClick={browseFiles}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOver(false);
              addFiles(Array.from(e.dataTransfer.files || []));
            }}
            className={`px-4 py-7 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
              dragOver
                ? "border-primary/60 bg-primary/5"
                : "border-border bg-bg hover:border-primary/30"
            }`}
          >
            <Upload className="w-5 h-5 mx-auto mb-2 text-text-secondary" />
            <p className="text-[13px] font-medium text-text-primary">
              Drag &amp; drop files here, or <span className="text-primary underline underline-offset-2">browse files</span>
            </p>
            <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed">
              {UPLOAD_LIMITS_TEXT}
            </p>
          </div>
          {uploadFiles.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Files ({uploadFiles.length}/{MAX_BATCH_SIZE})
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {uploadFiles.map((f, i) => {
                  const err = uploadErrorFor(f.name);
                  return (
                    <div key={`${f.name}-${i}`} className={`px-4 py-2.5 rounded-xl border ${err ? "bg-red-50/50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20" : "bg-bg border-border"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${TYPE_STYLES[f.name.split(".").pop()?.toLowerCase() || ""] || "bg-surface text-text-secondary"}`}>
                          <span className="text-[8px] font-bold">{(f.name.split(".").pop() || "?").slice(0, 4).toUpperCase()}</span>
                        </div>
                        <span className="text-[13px] text-text-primary truncate flex-1">{f.name}</span>
                        <span className="text-[11px] text-text-secondary shrink-0">
                          {formatSize(f.size)}
                        </span>
                        <button
                          onClick={() => removeUploadFile(i)}
                          className="p-1 rounded-md text-text-secondary/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                          title="Remove file"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {err && <p className="text-[11px] text-red-600 dark:text-red-400 mt-1.5">{err}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {uploadFiles.length === 1 && (
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
          )}
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
          <Button variant="secondary" onClick={closeUpload}>Cancel</Button>
          <Button loading={uploading} disabled={!uploadFiles.length} onClick={handleUpload}>
            <Upload className="w-4 h-4" />
            Upload{uploadFiles.length > 1 ? ` ${uploadFiles.length}` : ""}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
