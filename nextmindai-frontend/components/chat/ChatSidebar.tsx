"use client";

import type { Chat } from "@/lib/types";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface Props {
  chats: Chat[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

function IBrain() { return (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="6" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="18" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="12" cy="20" r="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".15"/><line x1="12" y1="8.5" x2="7.5" y2="12" stroke="currentColor" strokeWidth="1.5" opacity=".4"/><line x1="12" y1="8.5" x2="16.5" y2="12" stroke="currentColor" strokeWidth="1.5" opacity=".4"/><line x1="6" y1="16.5" x2="10.5" y2="19" stroke="currentColor" strokeWidth="1.5" opacity=".4"/><line x1="18" y1="16.5" x2="13.5" y2="19" stroke="currentColor" strokeWidth="1.5" opacity=".4"/></svg>); }
function IPlus() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>); }
function IChat() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>); }
function IDoc() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>); }
function IFolder() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>); }
function ISettings() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>); }
function IChevron({ d }: { d?: string }) { return (<svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: d === "down" ? "rotate(90deg)" : undefined }}><polyline points="9 18 15 12 9 6"/></svg>); }

export default function ChatSidebar({ chats, activeId, onSelect, onNew, collapsed, onToggle }: Props) {
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
              <button key={c.id} onClick={() => onSelect(c.id)} title={collapsed ? c.title : undefined} className={`w-full flex items-center gap-2.5 ${collapsed ? "justify-center px-0 py-2" : "px-2.5 py-2"} rounded-lg text-[13px] transition-all duration-150 text-left group ${activeId === c.id ? "bg-primary/5 text-primary font-medium" : "text-text-secondary hover:bg-bg hover:text-text-primary"}`}>
                <IChat/> {!collapsed && <span className="line-clamp-1">{c.title}</span>}
              </button>
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

      <div className="px-3 pb-4 flex justify-center">
        <a href="/settings" title={collapsed ? "Settings" : undefined} className={`flex items-center gap-2.5 ${collapsed ? "justify-center px-0 py-2" : "px-2.5 py-2 w-full"} rounded-lg text-[13px] text-text-secondary hover:bg-bg hover:text-text-primary transition-all`}><ISettings/> {!collapsed && "Settings"}</a>
      </div>
    </aside>
  );
}
