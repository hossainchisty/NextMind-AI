"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { chats } from "@/lib/data";
import {
  BrainNodeIcon,
  PlusIcon,
  ChatIcon,
  DocumentIcon,
  FolderIcon,
  SettingsIcon,
  ChevronIcon,
} from "@/components/ui/Icons";

interface SidebarProps {
  activeChatId?: string | null;
  onNewChat?: () => void;
  onSelectChat?: (chatId: string) => void;
}

export default function Sidebar({ activeChatId, onNewChat, onSelectChat }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [chatsExpanded, setChatsExpanded] = useState(true);
  const [knowledgeExpanded, setKnowledgeExpanded] = useState(true);

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-[260px] h-full flex flex-col bg-surface border-r border-border overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-[10px] bg-primary flex items-center justify-center text-white">
          <BrainNodeIcon className="w-5 h-5" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-text-primary">
          NextMind AI
        </span>
      </div>

      {/* New Chat Button */}
      <div className="px-3 mb-2">
        <button
          onClick={() => onNewChat?.()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-primary text-white text-[13px] font-medium hover:bg-primary-light transition-colors duration-200"
        >
          <PlusIcon className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {/* Chats Section */}
        <div className="mb-4">
          <button
            onClick={() => setChatsExpanded(!chatsExpanded)}
            className="flex items-center gap-1.5 w-full px-2 py-1.5 text-[11px] font-semibold tracking-wider text-text-secondary uppercase hover:text-text-primary transition-colors"
          >
            <ChevronIcon
              className="w-3 h-3 transition-transform duration-200"
              direction={chatsExpanded ? "down" : "right"}
            />
            Chats
          </button>
          {chatsExpanded && (
            <div className="mt-0.5 space-y-0.5">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => {
                    if (onSelectChat) onSelectChat(chat.id);
                    else router.push("/?chat=" + chat.id);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 text-left group ${
                    activeChatId === chat.id
                      ? "bg-primary/5 text-primary font-medium"
                      : "text-text-secondary hover:bg-bg hover:text-text-primary"
                  }`}
                >
                  <ChatIcon className="w-4 h-4 shrink-0 opacity-50 group-hover:opacity-70" />
                  <span className="line-clamp-1">{chat.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Knowledge Section */}
        <div className="mb-4">
          <button
            onClick={() => setKnowledgeExpanded(!knowledgeExpanded)}
            className="flex items-center gap-1.5 w-full px-2 py-1.5 text-[11px] font-semibold tracking-wider text-text-secondary uppercase hover:text-text-primary transition-colors"
          >
            <ChevronIcon
              className="w-3 h-3 transition-transform duration-200"
              direction={knowledgeExpanded ? "down" : "right"}
            />
            Knowledge
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
                <DocumentIcon className="w-4 h-4 shrink-0 opacity-50 group-hover:opacity-70" />
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
                <FolderIcon className="w-4 h-4 shrink-0 opacity-50 group-hover:opacity-70" />
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
          <SettingsIcon className="w-4 h-4 opacity-60" />
          Settings
        </button>
      </div>
    </aside>
  );
}
