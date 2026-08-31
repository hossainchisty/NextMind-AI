"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import {
  SearchIcon,
  UploadIcon,
  DocumentIcon,
  CheckIcon,
  FilterIcon,
  ChevronIcon,
} from "@/components/ui/Icons";
import { documents } from "@/lib/data";

const filterOptions = ["All", "Work", "Engineering", "Personal", "Research"];

export default function KnowledgePage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filtered = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === "All" || doc.collection === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[960px] mx-auto px-8 py-10">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-[26px] font-semibold tracking-tight text-text-primary mb-2">
              My Knowledge
            </h1>
            <p className="text-[15px] text-text-secondary">
              Manage the documents NextMind can understand and search.
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-6 animate-fade-in" style={{ animationDelay: "50ms" }}>
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
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
                <FilterIcon className="w-4 h-4" />
                {activeFilter}
                <ChevronIcon
                  className="w-3 h-3"
                  direction={showFilterDropdown ? "down" : "right"}
                />
              </button>
              {showFilterDropdown && (
                <div className="absolute top-11 right-0 w-44 bg-surface border border-border rounded-[10px] shadow-lg py-1.5 z-50 animate-slide-up">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setActiveFilter(opt);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-[13px] transition-colors ${
                        activeFilter === opt
                          ? "bg-primary/5 text-primary font-medium"
                          : "text-text-secondary hover:bg-bg hover:text-text-primary"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="h-10 px-4 rounded-[10px] bg-primary text-white text-[13px] font-medium hover:bg-primary-light transition-colors flex items-center gap-2">
              <UploadIcon className="w-4 h-4" />
              Upload
            </button>
          </div>

          {/* Document List */}
          <div className="bg-surface border border-border rounded-[12px] overflow-hidden animate-fade-in" style={{ animationDelay: "100ms" }}>
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_100px_80px_140px_100px] gap-4 px-5 py-3 border-b border-border text-[11px] font-semibold tracking-wider text-text-secondary uppercase">
              <span>Document</span>
              <span>Type</span>
              <span>Chunks</span>
              <span>Updated</span>
              <span>Status</span>
            </div>
            {/* Rows */}
            {filtered.map((doc) => (
              <div
                key={doc.id}
                className="grid grid-cols-[1fr_100px_80px_140px_100px] gap-4 px-5 py-3.5 border-b border-border/50 last:border-0 hover:bg-bg/50 transition-colors items-center group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-bg border border-border flex items-center justify-center shrink-0 group-hover:border-primary/20 transition-colors">
                    <DocumentIcon className="w-4 h-4 text-text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                      {doc.name}
                    </div>
                    <div className="text-[11px] text-text-secondary">
                      {doc.pages} pages · {doc.size}
                    </div>
                  </div>
                </div>
                <span className="text-[12px] text-text-secondary">{doc.type}</span>
                <span className="text-[12px] text-text-secondary font-mono">
                  {doc.chunks.toLocaleString()}
                </span>
                <span className="text-[12px] text-text-secondary">{doc.updatedAt}</span>
                <div>
                  {doc.indexed ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent-green/10 text-accent-green text-[11px] font-medium">
                      <CheckIcon className="w-3 h-3" />
                      Indexed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-50 text-yellow-600 text-[11px] font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                      Indexing
                    </span>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-5 py-16 text-center text-[14px] text-text-secondary">
                No documents found matching your search.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
