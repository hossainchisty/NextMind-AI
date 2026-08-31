"use client";

import Sidebar from "@/components/sidebar/Sidebar";
import { FolderIcon, PlusIcon, DocumentIcon } from "@/components/ui/Icons";
import { collections } from "@/lib/data";

const collectionColors: Record<string, string> = {
  Work: "bg-primary/10 text-primary",
  Engineering: "bg-blue-50 text-blue-600",
  Personal: "bg-purple-50 text-purple-600",
  Research: "bg-amber-50 text-amber-600",
};

export default function CollectionsPage() {
  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[960px] mx-auto px-8 py-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 animate-fade-in">
            <div>
              <h1 className="text-[26px] font-semibold tracking-tight text-text-primary mb-2">
                Collections
              </h1>
              <p className="text-[15px] text-text-secondary">
                Organize your documents into focused knowledge groups.
              </p>
            </div>
            <button className="h-10 px-4 rounded-[10px] bg-primary text-white text-[13px] font-medium hover:bg-primary-light transition-colors flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              New Collection
            </button>
          </div>

          {/* Grid */}
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
                    {col.updatedAt}
                  </span>
                </div>
                <h3 className="text-[16px] font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors">
                  {col.name}
                </h3>
                <div className="flex items-center gap-3 text-[12px] text-text-secondary">
                  <span className="flex items-center gap-1">
                    <DocumentIcon className="w-3.5 h-3.5" />
                    {col.documentCount} documents
                  </span>
                  <span>·</span>
                  <span>{col.totalSize}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
