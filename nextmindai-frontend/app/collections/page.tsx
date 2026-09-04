"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import {
  Folder,
  Plus,
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowLeft,
  X,
  Search,
  ChevronRight,
  Check,
} from "lucide-react";
import type { Collection, CollectionDetail, Document } from "@/lib/types";

const COLORS = [
  "bg-primary/10 text-primary",
  "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
];

function getCollectionColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function CollectionsPage() {
  const { toast, confirm } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [view, setView] = useState<"list" | "detail">("list");
  const [selected, setSelected] = useState<CollectionDetail | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [editCollection, setEditCollection] = useState<Collection | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [docSearch, setDocSearch] = useState("");
  const [docSearching, setDocSearching] = useState(false);
  const [docSearchDone, setDocSearchDone] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [allDocs, setAllDocs] = useState<Document[]>([]);

  const loadCollections = useCallback(async () => {
    try {
      const res = await api<{ data: Collection[] }>("/collections/", {});
      setCollections(res.data || []);
    } catch {
      /* empty */
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    try {
      const res = await api<{ data: CollectionDetail }>(`/collections/${id}/`, {});
      setSelected(res.data);
      setView("detail");
    } catch {
      toast("Failed to load collection", "error");
    }
  }, [toast]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  async function handleCreate() {
    if (!createName.trim()) return;
    setCreating(true);
    try {
      await api("/collections/", { method: "POST", json: { name: createName, description: createDesc } });
      setCreateName("");
      setCreateDesc("");
      setShowCreate(false);
      await loadCollections();
      toast("Collection created", "success");
    } catch {
      toast("Failed to create collection", "error");
    } finally {
      setCreating(false);
    }
  }

  function openEdit(col: Collection) {
    setEditCollection(col);
    setEditName(col.name);
    setEditDesc(col.description);
    setMenuOpen(null);
  }

  async function handleUpdate() {
    if (!editCollection || !editName.trim()) return;
    setSaving(true);
    try {
      await api(`/collections/${editCollection.id}/`, {
        method: "PATCH",
        json: { name: editName, description: editDesc },
      });
      setEditCollection(null);
      await loadCollections();
      if (selected?.id === editCollection.id) {
        await loadDetail(editCollection.id);
      }
      toast("Collection updated", "success");
    } catch {
      toast("Failed to update collection", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(col: Collection) {
    setMenuOpen(null);
    confirm(`Delete "${col.name}"? This cannot be undone.`, async () => {
      try {
        await api(`/collections/${col.id}/`, { method: "DELETE" });
        if (selected?.id === col.id) {
          setView("list");
          setSelected(null);
        }
        await loadCollections();
        toast("Collection deleted", "success");
      } catch {
        toast("Failed to delete collection", "error");
      }
    }, { confirmLabel: "Delete", type: "danger" });
  }

  async function handleRemoveDoc(docId: string) {
    if (!selected) return;
    try {
      await api(`/documents/${docId}/`, { method: "PATCH", json: { collection: null } });
      await loadDetail(selected.id);
      toast("Document removed from collection", "success");
    } catch {
      toast("Failed to remove document", "error");
    }
  }

  async function handleAssignDoc(docId: string) {
    if (!selected) return;
    setAssigning(true);
    try {
      await api(`/documents/${docId}/`, { method: "PATCH", json: { collection: selected.id } });
      await loadDetail(selected.id);
      setDocSearch("");
      setAllDocs([]);
      toast("Document added to collection", "success");
    } catch {
      toast("Failed to add document", "error");
    } finally {
      setAssigning(false);
    }
  }

  async function searchDocs(query: string) {
    if (!query.trim()) { setAllDocs([]); setDocSearchDone(false); return; }
    setDocSearching(true);
    setDocSearchDone(false);
    try {
      const res = await api<{ data: Document[] }>(`/documents/?search=${encodeURIComponent(query)}`, {});
      const assigned = selected?.documents.map(d => d.id) || [];
      const filtered = (res.data || []).filter(d => !assigned.includes(d.id));
      setAllDocs(filtered);
      setDocSearchDone(true);
    } catch {
      setAllDocs([]);
      setDocSearchDone(true);
    } finally {
      setDocSearching(false);
    }
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[960px] mx-auto px-8 py-10">
          {view === "list" ? (
            <>
              <div className="flex items-start justify-between mb-8 animate-fade-in">
                <div>
                  <h1 className="text-[26px] font-semibold tracking-tight text-text-primary mb-2">
                    Collections
                  </h1>
                  <p className="text-[15px] text-text-secondary">
                    Organize your documents into focused knowledge groups.
                  </p>
                </div>
                <Button onClick={() => setShowCreate(true)}>
                  <Plus className="w-4 h-4" />
                  New Collection
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: "50ms" }}>
                {collections.map((col, i) => (
                <div
                  key={col.id}
                  className="relative p-5 rounded-[16px] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 hover:border-primary/30 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer group"
                  style={{ animationDelay: `${i * 50}ms` }}
                  onClick={() => loadDetail(col.id)}
                >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-sm ${getCollectionColor(col.name)}`}>
                        <Folder className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-text-secondary">
                          {formatDate(col.created_at)}
                        </span>
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === col.id ? null : col.id); }}
                            className="p-1 rounded-md text-text-secondary/40 hover:text-text-primary hover:bg-bg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {menuOpen === col.id && (
                            <div className="absolute top-8 right-0 w-40 bg-surface border border-border rounded-[10px] shadow-lg py-1.5 z-50 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => openEdit(col)}
                                className="w-full text-left px-3.5 py-2 text-[13px] text-text-secondary hover:bg-bg hover:text-text-primary flex items-center gap-2 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => handleDelete(col)}
                                className="w-full text-left px-3.5 py-2 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-[16px] font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors">
                      {col.name}
                    </h3>
                    {col.description && (
                      <p className="text-[12px] text-text-secondary mb-2 line-clamp-2">{col.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-[12px] text-text-secondary">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {col.document_count} documents
                      </span>
                    </div>
                  </div>
                ))}
                {collections.length === 0 && (
                  <div className="col-span-2 py-16 text-center text-[14px] text-text-secondary bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-[16px] border border-white/30 dark:border-white/10">
                    No collections yet. Create one to organize your documents.
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-8 animate-fade-in">
                <button
                  onClick={() => { setView("list"); setSelected(null); }}
                  className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCollectionColor(selected?.name || "")}`}>
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <h1 className="text-[22px] font-semibold tracking-tight text-text-primary">
                        {selected?.name}
                      </h1>
                      {selected?.description && (
                        <p className="text-[13px] text-text-secondary">{selected.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant="primary" dot>{selected?.documents.length || 0} docs</Badge>
                <Button variant="ghost" size="sm" onClick={() => selected && openEdit(selected)}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => selected && handleDelete(selected)}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>

              <div className="mb-4 animate-fade-in" style={{ animationDelay: "50ms" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-4 h-4 text-text-secondary/50" />
                  <input
                    type="text"
                    value={docSearch}
                    onChange={(e) => { setDocSearch(e.target.value); searchDocs(e.target.value); }}
                    placeholder="Type to search documents..."
                    className="flex-1 h-9 px-3 rounded-lg bg-surface border border-border text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 transition-all"
                  />
                  {docSearching && (
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  )}
                </div>
                {docSearch.trim() && docSearchDone && allDocs.length === 0 && (
                  <div className="text-[12px] text-text-secondary py-3 text-center bg-surface/50 rounded-lg border border-border/50">
                    No documents found matching &ldquo;{docSearch}&rdquo;
                  </div>
                )}
                {allDocs.length > 0 && (
                  <div className="bg-surface border border-border rounded-[10px] max-h-48 overflow-y-auto">
                    {allDocs.map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 last:border-0 hover:bg-bg/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-text-secondary shrink-0" />
                          <span className="text-[13px] text-text-primary truncate">{doc.name}</span>
                          <span className="text-[11px] text-text-secondary shrink-0">{formatSize(doc.file_size)}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={assigning}
                          onClick={() => handleAssignDoc(doc.id)}
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-surface border border-border rounded-[12px] overflow-hidden animate-fade-in" style={{ animationDelay: "100ms" }}>
                <div className="grid grid-cols-[1fr_100px_140px_50px] gap-4 px-5 py-3 border-b border-border text-[11px] font-semibold tracking-wider text-text-secondary uppercase">
                  <span>Document</span>
                  <span>Type</span>
                  <span>Added</span>
                  <span></span>
                </div>
                {selected?.documents.map(doc => (
                  <div
                    key={doc.id}
                    className="grid grid-cols-[1fr_100px_140px_50px] gap-4 px-5 py-3.5 border-b border-border/50 last:border-0 hover:bg-bg/50 transition-colors items-center group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-bg border border-border flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-text-secondary" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-text-primary line-clamp-1">{doc.name}</div>
                        <div className="text-[11px] text-text-secondary">{formatSize(doc.file_size)}</div>
                      </div>
                    </div>
                    <span className="text-[12px] text-text-secondary uppercase">{doc.file_type}</span>
                    <span className="text-[12px] text-text-secondary">{formatDate(doc.created_at)}</span>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleRemoveDoc(doc.id)}
                        className="p-1.5 rounded-lg text-text-secondary/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove from collection"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {(!selected?.documents || selected.documents.length === 0) && (
                  <div className="px-5 py-16 text-center text-[14px] text-text-secondary">
                    No documents in this collection yet. Search above to add documents.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Collection">
        <div className="px-6 py-5 space-y-4">
          <Input
            label="Name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="e.g. Engineering Docs"
          />
          <Input
            label="Description"
            value={createDesc}
            onChange={(e) => setCreateDesc(e.target.value)}
            placeholder="Optional description"
          />
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button loading={creating} disabled={!createName.trim()} onClick={handleCreate}>Create</Button>
        </div>
      </Modal>

      <Modal open={!!editCollection} onClose={() => setEditCollection(null)} title="Edit Collection">
        <div className="px-6 py-5 space-y-4">
          <Input
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Collection name"
          />
          <Input
            label="Description"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Optional description"
          />
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="secondary" onClick={() => setEditCollection(null)}>Cancel</Button>
          <Button loading={saving} disabled={!editName.trim()} onClick={handleUpdate}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
