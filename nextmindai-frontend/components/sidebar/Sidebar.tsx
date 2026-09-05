"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import { BrainNodeIcon } from "@/components/ui/Icons";
import {
  MessageSquare,
  FileText,
  Folder,
  Settings,
} from "lucide-react";

interface SidebarProps {}

export default function Sidebar({}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { confirm } = useToast();
  const [knowledgeExpanded, setKnowledgeExpanded] = useState(true);

  const isActive = (path: string) => pathname === path;

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <aside className="w-[260px] h-full flex flex-col bg-surface border-r border-border overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-[10px] bg-btn text-btn-text flex items-center justify-center">
          <BrainNodeIcon className="w-5 h-5" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight">
          <span className="text-text-primary">Next</span>
          <span className="text-accent-green">Mind</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {/* Chat Link */}
        <div className="mb-4">
          <button
            onClick={() => router.push("/chat")}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 text-left group ${
              pathname === "/chat"
                ? "bg-primary/5 text-primary font-medium"
                : "text-text-secondary hover:bg-bg hover:text-text-primary"
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0 opacity-50 group-hover:opacity-70" />
            Chat
          </button>
        </div>

        {/* Knowledge Section */}
        <div className="mb-4">
          <button
            onClick={() => setKnowledgeExpanded(!knowledgeExpanded)}
            className="flex items-center gap-1.5 w-full px-2 py-1.5 text-[11px] font-semibold tracking-wider text-text-secondary uppercase hover:text-text-primary transition-colors"
          >
            Knowledge Base
          </button>
          {knowledgeExpanded && (
            <div className="mt-0.5 space-y-0.5">
              <button
                onClick={() => router.push("/knowledge")}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 text-left group ${
                  isActive("/knowledge")
                    ? "bg-primary/5 text-primary font-medium"
                    : "text-text-secondary hover:bg-bg hover:text-text-primary"
                }`}
              >
                <FileText className="w-4 h-4 shrink-0 opacity-50 group-hover:opacity-70" />
                My Documents
              </button>
              <button
                onClick={() => router.push("/collections")}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 text-left group ${
                  isActive("/collections")
                    ? "bg-primary/5 text-primary font-medium"
                    : "text-text-secondary hover:bg-bg hover:text-text-primary"
                }`}
              >
                <Folder className="w-4 h-4 shrink-0 opacity-50 group-hover:opacity-70" />
                Collections
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-2">
        <button
          onClick={() => router.push("/settings")}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 ${
            isActive("/settings")
              ? "bg-primary/5 text-primary font-medium"
              : "text-text-secondary hover:bg-bg hover:text-text-primary"
          }`}
        >
          <Settings className="w-4 h-4 opacity-60" />
          Settings
        </button>

        {user && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-bg/50 border border-border/50">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[12px] font-semibold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-text-primary truncate">{user.name}</div>
              <div className="text-[11px] text-text-secondary truncate">{user.email}</div>
            </div>
            <button
              onClick={() => confirm("Sign out of your account?", () => { logout(); router.push("/login"); }, { confirmLabel: "Sign out", type: "danger" })}
              className="p-1.5 rounded-md text-text-secondary/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
              title="Sign out"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
