"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CHATS, MESSAGES } from "@/lib/data";
import type { Msg, Source } from "@/lib/types";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatEmptyState from "@/components/chat/ChatEmptyState";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import SourcesPanel from "@/components/sources/SourcesPanel";

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [retrieving, setRetrieving] = useState(false);
  const [showSrc, setShowSrc] = useState(false);
  const [srcs, setSrcs] = useState<Source[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = CHATS.find(c => c.id === activeId);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, retrieving]);

  const searchParams = useSearchParams();
  useEffect(() => {
    const chatId = searchParams.get("chat");
    if (chatId && CHATS.find(c => c.id === chatId)) open(chatId);
  }, [searchParams]);

  function open(id: string) {
    setActiveId(id);
    const m = MESSAGES[id] || [];
    setMessages(m);
    setRetrieving(false);
    const last = [...m].reverse().find(x => x.role === "assistant");
    if (last?.sources) { setSrcs(last.sources); setShowSrc(true); } else { setSrcs([]); setShowSrc(false); }
  }

  function fresh() {
    setActiveId(null);
    setMessages([]);
    setRetrieving(false);
    setSrcs([]);
    setShowSrc(false);
  }

  function ask(text: string) {
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages(p => [...p, { id: "u-" + Date.now(), role: "user", content: text, timestamp: ts }]);
    setRetrieving(true);
    setTimeout(() => {
      setRetrieving(false);
      const r = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const ai: Msg = { id: "a-" + Date.now(), role: "assistant", content: "Based on your uploaded documents, I can help answer that question. The information comes from multiple sources in your knowledge base, ensuring accuracy and grounding in your actual documents.\n\nLet me know if you'd like me to explore this topic further.", sources: [{ id: "x", documentName: "Employee Handbook.pdf", section: "General", page: 8, relevance: "High", preview: "Comprehensive information about company policies and procedures." }], timestamp: r };
      setMessages(p => [...p, ai]);
      setSrcs(ai.sources || []);
      setShowSrc(true);
    }, 2500);
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <ChatSidebar chats={CHATS} activeId={activeId} onSelect={open} onNew={fresh} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />
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
