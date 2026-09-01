"use client";

import { useState, useRef, useEffect } from "react";
import type { Chat } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface Props {
  chats: Chat[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

function IBrain() { return (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="6" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="18" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="12" cy="20" r="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".15"/><line x1="12" y1="8.5" x2="7.5" y2="12" stroke="currentColor" strokeWidth="1.5" opacity=".4"/><line x1="12" y1="8.5" x2="16.5" y2="12" stroke="currentColor" strokeWidth="1.5" opacity=".4"/><line x1="6" y1="16.5" x2="10.5" y2="19" stroke="currentColor" strokeWidth="1.5" opacity=".4"/><line x1="18" y1="16.5" x2="13.5" y2="19" stroke="currentColor" strokeWidth="1.5" opacity=".4"/></svg>); }
function IPlus() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>); }
function IChat() { return (<svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>); }
function IDoc() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>); }
function IFolder() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>); }
function ISettings() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>); }
function IChevron({ d }: { d?: string }) { return (<svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: d === "down" ? "rotate(90deg)" : undefined }}><polyline points="9 18 15 12 9 6"/></svg>); }
function IEllipsis() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>); }
function IEdit() { return (<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>); }
function ITrash() { return (<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>); }
function ICheck() { return (<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>); }
function IX() { return (<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>); }

function ChatItem({ chat, isActive, onSelect, onRename, onDelete, collapsed }: {
  chat: Chat; isActive: boolean; onSelect: () => void;
  onRename: (title: string) => void; onDelete: () => void; collapsed: boolean;
}) {
  const { confirm } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(chat.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setEditing(false);
      }
    }
    if (menuOpen || editing) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen, editing]);

  function saveRename() {
    const t = editVal.trim();
    if (t && t !== chat.title) onRename(t);
    setEditing(false);
    setMenuOpen(false);
  }

  if (collapsed) {
    return (
      <button onClick={onSelect} title={chat.title}
        className={`w-full flex items-center justify-center px-0 py-2 rounded-lg text-[13px] transition-all duration-150 ${isActive ? "bg-primary/5 text-primary font-medium" : "text-text-secondary hover:bg-bg hover:text-text-primary"}`}>
        <IChat/>
      </button>
    );
  }

  return (
    <div className="relative group">
      <button onClick={onSelect}
        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 text-left ${isActive ? "bg-primary/5 text-primary font-medium" : "text-text-secondary hover:bg-bg hover:text-text-primary"}`}>
        <IChat/>
        {editing ? (
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <input ref={inputRef} value={editVal} onChange={(e) => setEditVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveRename(); if (e.key === "Escape") { setEditing(false); setEditVal(chat.title); } }}
              className="flex-1 min-w-0 px-1.5 py-0.5 rounded bg-bg border border-primary/30 text-text-primary text-[13px] outline-none"
              onClick={(e) => e.stopPropagation()} />
            <button onClick={(e) => { e.stopPropagation(); saveRename(); }} className="p-0.5 rounded hover:bg-primary/10 text-primary shrink-0"><ICheck/></button>
            <button onClick={(e) => { e.stopPropagation(); setEditing(false); setEditVal(chat.title); setMenuOpen(false); }} className="p-0.5 rounded hover:bg-red-50 text-text-secondary shrink-0"><IX/></button>
          </div>
        ) : (
          <span className="line-clamp-1 flex-1 min-w-0">{chat.title}</span>
        )}
      </button>
      {!editing && (
        <div ref={menuRef} className="absolute right-1.5 top-1/2 -translate-y-1/2 z-50">
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className={`p-1 rounded-md hover:bg-bg text-text-secondary transition-opacity ${menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            <IEllipsis/>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 py-1 rounded-lg bg-surface border border-border shadow-xl z-[60]">
              <button onClick={(e) => { e.stopPropagation(); setEditing(true); setEditVal(chat.title); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-secondary hover:bg-bg hover:text-text-primary transition-colors">
                <IEdit/> Rename
              </button>
              <button onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                confirm("Delete this chat permanently?", () => onDelete(), { confirmLabel: "Delete", type: "danger" });
              }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors">
                <ITrash/> Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChatSidebar({ chats, activeId, onSelect, onNew, onRename, onDelete, collapsed, onToggle }: Props) {
  const { user, logout } = useAuth();
  const { confirm, toast } = useToast();
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <aside className={`${collapsed ? "w-[68px]" : "w-[260px]"} h-full flex flex-col bg-surface border-r border-border overflow-hidden shrink-0 transition-all duration-300 ease-in-out`}>
      <div className={`px-4 py-4 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-primary flex items-center justify-center text-white shrink-0"><IBrain/></div>
          {!collapsed && <span className="text-[15px] font-semibold tracking-tight text-text-primary whitespace-nowrap">NextMind AI</span>}
        </div>
        {!collapsed && (
          <button onClick={onToggle} className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors" title="Collapse sidebar">
            <PanelLeftClose className="w-4 h-4"/>
          </button>
        )}
      </div>

      {collapsed && (
        <div className="px-2 mb-2 flex justify-center">
          <button onClick={onToggle} className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors" title="Expand sidebar">
            <PanelLeftOpen className="w-4 h-4"/>
          </button>
        </div>
      )}

      <div className={`px-3 mb-2 ${collapsed ? "flex justify-center" : ""}`}>
        <button onClick={onNew} className={`${collapsed ? "w-10 h-10 p-0 justify-center" : "w-full px-4 py-2.5"} flex items-center gap-2 rounded-[10px] bg-primary text-white text-[13px] font-medium hover:bg-primary-light transition-colors`}>
          <IPlus/> {!collapsed && "New Chat"}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="mb-4">
          {!collapsed && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold tracking-wider text-text-secondary uppercase"><IChevron d="down"/> Chats</div>
          )}
          <div className="mt-0.5 space-y-0.5">
            {chats.map(c => (
              <ChatItem
                key={c.id}
                chat={c}
                isActive={activeId === c.id}
                onSelect={() => onSelect(c.id)}
                onRename={(title) => onRename(c.id, title)}
                onDelete={() => onDelete(c.id)}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>
        <div>
          {!collapsed && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold tracking-wider text-text-secondary uppercase"><IChevron d="down"/> Knowledge</div>
          )}
          <div className="mt-0.5 space-y-0.5">
            <a href="/knowledge" title={collapsed ? "My Documents" : undefined} className={`flex items-center gap-2.5 ${collapsed ? "justify-center px-0 py-2" : "px-2.5 py-2"} rounded-lg text-[13px] text-text-secondary hover:bg-bg hover:text-text-primary transition-all`}><IDoc/> {!collapsed && "My Documents"}</a>
            <a href="/collections" title={collapsed ? "Collections" : undefined} className={`flex items-center gap-2.5 ${collapsed ? "justify-center px-0 py-2" : "px-2.5 py-2"} rounded-lg text-[13px] text-text-secondary hover:bg-bg hover:text-text-primary transition-all`}><IFolder/> {!collapsed && "Collections"}</a>
          </div>
        </div>
      </nav>

      <div className="px-3 pb-4 space-y-2">
        <a href="/settings" title={collapsed ? "Settings" : undefined} className={`flex items-center gap-2.5 ${collapsed ? "justify-center px-0 py-2" : "px-2.5 py-2 w-full"} rounded-lg text-[13px] text-text-secondary hover:bg-bg hover:text-text-primary transition-all`}><ISettings/> {!collapsed && "Settings"}</a>
        {user && !collapsed && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-bg/50 border border-border/50">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[12px] font-semibold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-text-primary truncate">{user.name}</div>
              <div className="text-[11px] text-text-secondary truncate">{user.email}</div>
            </div>
            <button
              onClick={() => confirm("Sign out of your account?", () => { logout(); window.location.href = "/login"; }, { confirmLabel: "Sign out", type: "danger" })}
              className="p-1.5 rounded-md text-text-secondary/50 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              title="Sign out"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        )}
        {user && collapsed && (
          <div className="flex justify-center" title={`${user.name} - Sign out`}>
            <button
              onClick={() => confirm("Sign out?", () => { logout(); window.location.href = "/login"; }, { confirmLabel: "Sign out", type: "danger" })}
              className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[12px] font-semibold hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              {initials}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
