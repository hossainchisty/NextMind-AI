"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Chat, Msg, Source } from "@/lib/types";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatEmptyState from "@/components/chat/ChatEmptyState";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import SourcesPanel from "@/components/sources/SourcesPanel";

export default function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [retrieving, setRetrieving] = useState(false);
  const [showSrc, setShowSrc] = useState(false);
  const [srcs, setSrcs] = useState<Source[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = chats.find((c) => c.id === activeId);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, retrieving]);

  const loadChats = useCallback(async () => {
    try {
      const res = await api<{ data: Array<{ id: string; title: string; updated_at: string; last_message?: { content: string } }> }>("/conversations/", {});
      const mapped: Chat[] = (res.data || []).map((c) => ({
        id: c.id,
        title: c.title,
        lastMessage: c.last_message?.content?.slice(0, 60) || "",
        updatedAt: new Date(c.updated_at).toLocaleDateString(),
      }));
      setChats(mapped);
    } catch {
      /* empty */
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const searchParams = useSearchParams();
  useEffect(() => {
    const chatId = searchParams.get("chat");
    if (chatId) open(chatId);
  }, [searchParams]);

  async function open(id: string) {
    setActiveId(id);
    setRetrieving(false);
    try {
      const res = await api<{ data: { messages: Array<{ id: string; role: string; content: string; metadata?: Record<string, unknown>; created_at: string }> } }>(
        `/conversations/${id}/`,
        {}
      );
      const mapped: Msg[] = (res.data?.messages || []).map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        sources: m.metadata?.citations
          ? (m.metadata.citations as Array<{ source_id: number; document_id: string; document_name: string; page_number: number; section_title: string }>).map((c) => ({
              id: String(c.source_id),
              documentName: c.document_name,
              section: c.section_title || "",
              page: c.page_number,
              relevance: "High" as const,
              preview: "",
            }))
          : undefined,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));
      setMessages(mapped);
      const last = [...mapped].reverse().find((x) => x.role === "assistant");
      if (last?.sources) {
        setSrcs(last.sources);
        setShowSrc(true);
      } else {
        setSrcs([]);
        setShowSrc(false);
      }
    } catch {
      setMessages([]);
    }
  }

  function fresh() {
    setActiveId(null);
    setMessages([]);
    setRetrieving(false);
    setSrcs([]);
    setShowSrc(false);
  }

  async function renameChat(id: string, title: string) {
    try {
      await api(`/conversations/${id}/`, { method: "PATCH", json: { title } });
      setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
    } catch {
      /* empty */
    }
  }

  async function deleteChat(id: string) {
    try {
      await api(`/conversations/${id}/`, { method: "DELETE" });
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) fresh();
    } catch {
      /* empty */
    }
  }

  async function ask(text: string, provider?: string, model?: string) {
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((p) => [...p, { id: "u-" + Date.now(), role: "user", content: text, timestamp: ts }]);
    setRetrieving(true);

    try {
      const res = await api<{
        data: {
          conversation_id: string;
          message: { id: string; role: string; content: string; citations: Array<{ source_id: number; document_id: string; document_name: string; page_number: number; section_title: string }> };
        };
      }>("/chat/", {
        method: "POST",
        json: {
          message: text,
          conversation_id: activeId || undefined,
          provider: provider || undefined,
          model: model || undefined,
        },
      });

      const msg = res.data.message;
      const sources: Source[] = (msg.citations || []).map((c) => ({
        id: String(c.source_id),
        documentName: c.document_name,
        section: c.section_title || "",
        page: c.page_number,
        relevance: "High" as const,
        preview: "",
      }));

      const ai: Msg = {
        id: msg.id,
        role: "assistant",
        content: msg.content,
        sources,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((p) => [...p, ai]);
      setSrcs(sources);
      setShowSrc(sources.length > 0);

      if (!activeId && res.data.conversation_id) {
        setActiveId(res.data.conversation_id);
        loadChats();
      }
    } catch {
      setMessages((p) => [
        ...p,
        {
          id: "e-" + Date.now(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setRetrieving(false);
    }
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <ChatSidebar
        chats={chats}
        activeId={activeId}
        onSelect={open}
        onNew={fresh}
        onRename={renameChat}
        onDelete={deleteChat}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
      />
      <div className="flex flex-1 h-full overflow-hidden">
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {activeId && <ChatHeader title={active?.title ?? ""} />}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <ChatEmptyState onAsk={ask} />
            ) : (
              <ChatMessages messages={messages} retrieving={retrieving} />
            )}
          </div>
          <ChatInput onSend={ask} />
        </div>
        {showSrc && srcs.length > 0 && <SourcesPanel sources={srcs} />}
      </div>
    </div>
  );
}
