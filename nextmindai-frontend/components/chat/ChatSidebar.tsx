"use client";

import { useState, useRef, useEffect } from "react";
import type { Chat } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { BrainNodeIcon } from "@/components/ui/Icons";
import {
  Plus,
  MessageSquare,
  FileText,
  Folder,
  Settings,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  X,
  LogOut,
} from "lucide-react";

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

  useClickOutside(menuRef, () => {
    setMenuOpen(false);
    setEditing(false);
  });

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
        <MessageSquare className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="relative group">
      <button onClick={onSelect}
        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 text-left ${isActive ? "bg-primary/5 text-primary font-medium" : "text-text-secondary hover:bg-bg hover:text-text-primary"}`}>
        <MessageSquare className="w-4 h-4 shrink-0" />
        {editing ? (
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <input ref={inputRef} value={editVal} onChange={(e) => setEditVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveRename(); if (e.key === "Escape") { setEditing(false); setEditVal(chat.title); } }}
              className="flex-1 min-w-0 px-1.5 py-0.5 rounded bg-bg border border-primary/30 text-text-primary text-[13px] outline-none"
              onClick={(e) => e.stopPropagation()} />
            <button onClick={(e) => { e.stopPropagation(); saveRename(); }} className="p-0.5 rounded hover:bg-primary/10 text-primary shrink-0"><Check className="w-3.5 h-3.5" /></button>
            <button onClick={(e) => { e.stopPropagation(); setEditing(false); setEditVal(chat.title); setMenuOpen(false); }} className="p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-text-secondary shrink-0"><X className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <span className="line-clamp-1 flex-1 min-w-0">{chat.title}</span>
        )}
      </button>
      {!editing && (
        <div ref={menuRef} className="absolute right-1.5 top-1/2 -translate-y-1/2 z-50">
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className={`p-1 rounded-md hover:bg-bg text-text-secondary transition-opacity ${menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 py-1 rounded-lg bg-surface border border-border shadow-xl z-[60]">
              <button onClick={(e) => { e.stopPropagation(); setEditing(true); setEditVal(chat.title); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-secondary hover:bg-bg hover:text-text-primary transition-colors">
                <Edit className="w-3.5 h-3.5" /> Rename
              </button>
              <button onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                confirm("Delete this chat permanently?", () => onDelete(), { confirmLabel: "Delete", type: "danger" });
              }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
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
  const { confirm } = useToast();
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <aside className={`${collapsed ? "w-[68px]" : "w-[260px]"} h-full flex flex-col bg-surface border-r border-border overflow-hidden shrink-0 transition-all duration-300 ease-in-out`}>
      <div className={`px-4 py-4 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-btn text-btn-text flex items-center justify-center shrink-0">
            <BrainNodeIcon className="w-5 h-5" />
          </div>
          {!collapsed && <span className="text-[15px] font-semibold tracking-tight whitespace-nowrap"><span className="text-text-primary">Next</span><span className="text-accent-green">Mind</span></span>}
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
        <button onClick={onNew} className={`${collapsed ? "w-10 h-10 p-0 justify-center" : "w-full px-4 py-2.5"} flex items-center gap-2 rounded-[10px] bg-btn text-btn-text text-[13px] font-medium hover:bg-btn-hover transition-colors`}>
          <Plus className="w-4 h-4" /> {!collapsed && "New Chat"}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="mb-4">
          {!collapsed && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold tracking-wider text-text-secondary uppercase">
              <ChevronRight className="w-3 h-3" /> Chats
            </div>
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
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold tracking-wider text-text-secondary uppercase">
              <ChevronRight className="w-3 h-3" /> Knowledge
            </div>
          )}
          <div className="mt-0.5 space-y-0.5">
            <a href="/knowledge" title={collapsed ? "My Documents" : undefined} className={`flex items-center gap-2.5 ${collapsed ? "justify-center px-0 py-2" : "px-2.5 py-2"} rounded-lg text-[13px] text-text-secondary hover:bg-bg hover:text-text-primary transition-all`}>
              <FileText className="w-4 h-4" /> {!collapsed && "My Documents"}
            </a>
            <a href="/collections" title={collapsed ? "Collections" : undefined} className={`flex items-center gap-2.5 ${collapsed ? "justify-center px-0 py-2" : "px-2.5 py-2"} rounded-lg text-[13px] text-text-secondary hover:bg-bg hover:text-text-primary transition-all`}>
              <Folder className="w-4 h-4" /> {!collapsed && "Collections"}
            </a>
          </div>
        </div>
      </nav>

      <div className="px-3 pb-4 space-y-2">
        <a href="/settings" title={collapsed ? "Settings" : undefined} className={`flex items-center gap-2.5 ${collapsed ? "justify-center px-0 py-2" : "px-2.5 py-2 w-full"} rounded-lg text-[13px] text-text-secondary hover:bg-bg hover:text-text-primary transition-all`}>
          <Settings className="w-4 h-4" /> {!collapsed && "Settings"}
        </a>
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
              className="p-1.5 rounded-md text-text-secondary/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
        {user && collapsed && (
          <div className="flex justify-center" title={`${user.name} - Sign out`}>
            <button
              onClick={() => confirm("Sign out?", () => { logout(); window.location.href = "/login"; }, { confirmLabel: "Sign out", type: "danger" })}
              className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[12px] font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              {initials}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
