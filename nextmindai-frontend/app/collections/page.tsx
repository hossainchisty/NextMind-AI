"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import { api } from "@/lib/api";
import { FolderIcon, PlusIcon, DocumentIcon } from "@/components/ui/Icons";

interface Collection {
  id: string;
  name: string;
  description: string;
  document_count: number;
  created_at: string;
}

const collectionColors: Record<string, string> = {
  Work: "bg-primary/10 text-primary",
  Engineering: "bg-blue-50 text-blue-600",
  Personal: "bg-purple-50 text-purple-600",
  Research: "bg-amber-50 text-amber-600",
};

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const loadCollections = useCallback(async () => {
    try {
      const res = await api<{ data: Collection[] }>("/collections/", {});
      setCollections(res.data || []);
    } catch {
      /* empty */
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await api("/collections/", { method: "POST", json: { name: newName, description: newDesc } });
      setNewName("");
      setNewDesc("");
      setShowNew(false);
      await loadCollections();
    } catch {
      /* empty */
    } finally {
      setCreating(false);
    }
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[960px] mx-auto px-8 py-10">
          <div className="flex items-start justify-between mb-8 animate-fade-in">
            <div>
              <h1 className="text-[26px] font-semibold tracking-tight text-text-primary mb-2">
                Collections
              </h1>
              <p className="text-[15px] text-text-secondary">
                Organize your documents into focused knowledge groups.
              </p>
            </div>
            <button
              onClick={() => setShowNew(!showNew)}
              className="h-10 px-4 rounded-[10px] bg-primary text-white text-[13px] font-medium hover:bg-primary-light transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              New Collection
            </button>
          </div>

          {showNew && (
            <div className="mb-6 p-4 bg-surface border border-border rounded-[12px] animate-slide-up">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Collection name"
                className="w-full h-10 px-3 mb-3 rounded-[10px] bg-bg border border-border text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/5 transition-all"
              />
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full h-10 px-3 mb-3 rounded-[10px] bg-bg border border-border text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/5 transition-all"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={creating || !newName.trim()}
                  className="h-9 px-4 rounded-[10px] bg-primary text-white text-[13px] font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
                <button
                  onClick={() => setShowNew(false)}
                  className="h-9 px-4 rounded-[10px] bg-surface border border-border text-[13px] text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: "50ms" }}>
            {collections.map((col, i) => (
              <div
                key={col.id}
                className="p-5 rounded-[12px] bg-surface border border-border hover:border-primary/20 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-200 cursor-pointer group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      collectionColors[col.name] || "bg-bg text-text-secondary"
                    }`}
                  >
                    <FolderIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-text-secondary">
                    {formatDate(col.created_at)}
                  </span>
                </div>
                <h3 className="text-[16px] font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors">
                  {col.name}
                </h3>
                {col.description && (
                  <p className="text-[12px] text-text-secondary mb-2 line-clamp-2">{col.description}</p>
                )}
                <div className="flex items-center gap-3 text-[12px] text-text-secondary">
                  <span className="flex items-center gap-1">
                    <DocumentIcon className="w-3.5 h-3.5" />
                    {col.document_count} documents
                  </span>
                </div>
              </div>
            ))}
            {collections.length === 0 && (
              <div className="col-span-2 py-16 text-center text-[14px] text-text-secondary">
                No collections yet. Create one to organize your documents.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
