"use client";

import { useState, useRef, useEffect } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────

interface Chat { id: string; title: string; lastMessage: string; updatedAt: string }
interface Source { id: string; documentName: string; section: string; page: number; relevance: "High" | "Medium" | "Low"; preview: string }
interface Msg { id: string; role: "user" | "assistant"; content: string; sources?: Source[]; timestamp: string }

const CHATS: Chat[] = [
  { id: "1", title: "Project Architecture", lastMessage: "How is the system designed?", updatedAt: "2 min ago" },
  { id: "2", title: "Django Authentication", lastMessage: "Explain the auth flow", updatedAt: "15 min ago" },
  { id: "3", title: "Employee Handbook", lastMessage: "What is the leave policy?", updatedAt: "1 hour ago" },
  { id: "4", title: "AWS Infrastructure", lastMessage: "How are services deployed?", updatedAt: "3 hours ago" },
  { id: "5", title: "Database Design", lastMessage: "Show me the schema", updatedAt: "Yesterday" },
];

const MESSAGES: Record<string, Msg[]> = {
  "1": [
    { id: "pa-1", role: "user", content: "How is the system architecture designed?", timestamp: "10:12 AM" },
    { id: "pa-2", role: "assistant", content: "Based on the Architecture Overview document, here's how the system is designed:\n\n## System Architecture\n\nThe platform follows a **microservices architecture** with event-driven communication between services. [1]\n\n### Core Components\n\n| Service | Technology | Purpose |\n|---------|-----------|----------|\n| API Gateway | Kong | Request routing, rate limiting |\n| Auth Service | Django + JWT | Authentication & authorization |\n| Knowledge Engine | Python + FastAPI | Document processing & RAG |\n| Vector Store | Qdrant | Embedding storage & retrieval |\n| LLM Runtime | Ollama | Local model inference |\n\n### Data Flow\n\n1. User submits a query through the frontend\n2. API Gateway routes to the Knowledge Engine\n3. Hybrid search retrieves relevant chunks from Qdrant\n4. Reranker scores and filters top results\n5. LLM generates an answer grounded in retrieved context [2]", sources: [
      { id: "pa-s1", documentName: "Architecture Overview.pdf", section: "System Design", page: 3, relevance: "High", preview: "The platform follows a microservices architecture with event-driven communication between core services." },
      { id: "pa-s2", documentName: "Architecture Overview.pdf", section: "Data Flow", page: 7, relevance: "High", preview: "Queries flow through the API Gateway to the Knowledge Engine, which performs hybrid search and reranking." },
    ], timestamp: "10:13 AM" },
  ],
  "2": [
    { id: "da-1", role: "user", content: "Explain the Django authentication flow", timestamp: "11:45 AM" },
    { id: "da-2", role: "assistant", content: "Here's how authentication works in the Django backend:\n\n## Authentication Flow\n\nThe system uses **JWT (JSON Web Tokens)** for stateless authentication. [1]\n\n### Login Process\n\n1. User submits credentials to `/api/auth/login/`\n2. Django validates credentials against the User model\n3. A JWT access token and refresh token are generated\n4. Tokens are returned to the client\n\n### Token Management\n\n- **Access Token**: Short-lived (15 minutes), used for API requests\n- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens\n- Tokens are stored in HTTP-only cookies for security [2]\n\n### Password Security\n\n- Passwords are hashed using **PBKDF2** with SHA256\n- Salt is generated per-user during account creation\n- Password policy enforces minimum 12 characters", sources: [
      { id: "da-s1", documentName: "API Documentation.md", section: "Authentication", page: 2, relevance: "High", preview: "The system uses JWT for stateless authentication with short-lived access tokens and long-lived refresh tokens." },
      { id: "da-s2", documentName: "Security Policy.pdf", section: "Token Management", page: 5, relevance: "Medium", preview: "Tokens are stored in HTTP-only cookies to prevent XSS attacks and ensure secure token handling." },
    ], timestamp: "11:46 AM" },
  ],
  "3": [
    { id: "1", role: "user", content: "What is the annual leave policy for employees?", timestamp: "2:34 PM" },
    { id: "2", role: "assistant", content: "Based on the Employee Handbook, here's the annual leave policy:\n\n## Annual Leave Entitlement\n\nEmployees are entitled to **14 days** of annual leave per calendar year. [1]\n\n### Key Details\n\n- Leave must be requested at least **5 working days** in advance\n- Unused leave may be carried forward up to **5 days** to the next year, with manager approval [2]\n- Leave is accrued proportionally for part-time employees\n- New employees accrue leave from their start date\n\n### Public Holidays\n\nIn addition to annual leave, employees receive **10 public holidays** per year. [1]\n\n### Leave Request Process\n\n1. Submit request through the HR portal\n2. Await manager approval (typically within 48 hours)\n3. Approved leave is reflected in your next payslip", sources: [
      { id: "s1", documentName: "Employee Handbook.pdf", section: "Annual Leave Policy", page: 14, relevance: "High", preview: "Employees are entitled to 14 days of annual leave per calendar year. Unused leave may be carried forward with manager approval." },
      { id: "s2", documentName: "Employee Handbook.pdf", section: "Leave Carry Forward", page: 15, relevance: "High", preview: "Up to 5 days of unused annual leave may be carried forward to the following year subject to manager approval." },
      { id: "s3", documentName: "Employee Handbook.pdf", section: "Public Holidays", page: 16, relevance: "Medium", preview: "In addition to annual leave, the company observes 10 public holidays per year as outlined in the holiday calendar." },
    ], timestamp: "2:34 PM" },
  ],
  "4": [
    { id: "aws-1", role: "user", content: "How are services deployed on AWS?", timestamp: "3:20 PM" },
    { id: "aws-2", role: "assistant", content: "Here's an overview of the AWS infrastructure deployment:\n\n## Deployment Architecture\n\nServices are deployed on **AWS** using a combination of ECS Fargate and managed services. [1]\n\n### Infrastructure Stack\n\n| Resource | AWS Service | Configuration |\n|----------|------------|----------------|\n| Compute | ECS Fargate | Auto-scaling 2-10 tasks |\n| Database | RDS PostgreSQL | db.t3.large, Multi-AZ |\n| Cache | ElastiCache Redis | cache.t3.medium |\n| Storage | S3 | Versioned, encrypted |\n| CDN | CloudFront | Global edge caching |\n\n### CI/CD Pipeline\n\n1. Code pushed to GitHub repository\n2. GitHub Actions builds and tests the code\n3. Docker image pushed to ECR\n4. ECS service automatically rolls out the new task definition [2]", sources: [
      { id: "aws-s1", documentName: "Architecture Overview.pdf", section: "Cloud Infrastructure", page: 18, relevance: "High", preview: "Services are deployed on AWS using ECS Fargate with auto-scaling and managed database services." },
      { id: "aws-s2", documentName: "Architecture Overview.pdf", section: "CI/CD", page: 22, relevance: "Medium", preview: "GitHub Actions builds, tests, and deploys Docker images to ECR with automatic ECS rolling deployments." },
    ], timestamp: "3:21 PM" },
  ],
  "5": [
    { id: "db-1", role: "user", content: "Show me the database schema", timestamp: "Yesterday" },
    { id: "db-2", role: "assistant", content: "Here's the core database schema design:\n\n## Database Schema\n\nThe system uses **PostgreSQL** with the following core tables:\n\n### Users & Authentication\n\n| Table | Key Columns | Description |\n|-------|------------|-------------|\n| `users` | id, email, password_hash, created_at | Core user accounts |\n| `user_profiles` | user_id, display_name, avatar_url | Extended user info |\n| `refresh_tokens` | user_id, token, expires_at | JWT refresh tokens |\n\n### Knowledge Base\n\n| Table | Key Columns | Description |\n|-------|------------|-------------|\n| `documents` | id, user_id, name, type, status | Uploaded documents |\n| `chunks` | id, document_id, content, embedding | Processed text chunks |\n| `collections` | id, user_id, name | Document groupings |\n| `chat_history` | id, user_id, messages, created_at | Conversation logs |\n\n### Relationships\n\n- A **User** has many **Documents** and **Collections**\n- A **Document** has many **Chunks** (split during indexing)\n- **Chunks** are linked to **Documents** via foreign key\n- **Chat History** references **Documents** through citation links [1]", sources: [
      { id: "db-s1", documentName: "Architecture Overview.pdf", section: "Database Design", page: 12, relevance: "High", preview: "PostgreSQL is used as the primary database with tables for users, documents, chunks, and collections." },
    ], timestamp: "Yesterday" },
  ],
};

// ── Icons ─────────────────────────────────────────────────────────────────────

function IBrain() { return (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="6" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="18" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="12" cy="20" r="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".15"/><line x1="12" y1="8.5" x2="7.5" y2="12" stroke="currentColor" strokeWidth="1.5" opacity=".4"/><line x1="12" y1="8.5" x2="16.5" y2="12" stroke="currentColor" strokeWidth="1.5" opacity=".4"/><line x1="6" y1="16.5" x2="10.5" y2="19" stroke="currentColor" strokeWidth="1.5" opacity=".4"/><line x1="18" y1="16.5" x2="13.5" y2="19" stroke="currentColor" strokeWidth="1.5" opacity=".4"/></svg>); }
function IPlus() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>); }
function IChat() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>); }
function IDoc() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>); }
function IFolder() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>); }
function ISettings() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>); }
function ISearch() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>); }
function ISend() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>); }
function IAttach() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>); }
function IShare() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>); }
function IFile() { return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>); }
function IChevron({ d }: { d?: string }) { return (<svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: d === "down" ? "rotate(90deg)" : undefined }}><polyline points="9 18 15 12 9 6"/></svg>); }

// ── Markdown ──────────────────────────────────────────────────────────────────

function md(s: string) {
  const lines = s.split("\n"), els: React.ReactNode[] = [];
  let inCode = false, code = "", tbl: string[][] = [];
  const il = (t: string, k: string) => {
    const p: React.ReactNode[] = []; let r = t, i = 0;
    while (r.length) {
      const bM = r.match(/\*\*(.+?)\*\*/), cM = r.match(/`(.+?)`/), nM = r.match(/\[(\d+)\]/);
      let f = null, mt = "", mi = Infinity;
      if (bM && r.indexOf(bM[0]) < mi) { mi = r.indexOf(bM[0]); f = bM; mt = "b"; }
      if (cM && r.indexOf(cM[0]) < mi) { mi = r.indexOf(cM[0]); f = cM; mt = "c"; }
      if (nM && r.indexOf(nM[0]) < mi) { mi = r.indexOf(nM[0]); f = nM; mt = "n"; }
      if (!f) { p.push(<span key={`${k}${i}`}>{r}</span>); break; }
      const before = r.substring(0, mi);
      if (before) p.push(<span key={`${k}${i}x`}>{before}</span>);
      if (mt === "b") p.push(<strong key={`${k}${i}s`} className="font-semibold text-text-primary">{f![1]}</strong>);
      else if (mt === "c") p.push(<code key={`${k}${i}c`} className="px-1.5 py-0.5 rounded-md bg-bg border border-border text-[13px] font-mono text-primary">{f![1]}</code>);
      else p.push(<sup key={`${k}${i}n`} className="inline-flex items-center justify-center w-[18px] h-[14px] rounded bg-citation-bg text-accent-green text-[10px] font-semibold cursor-pointer mx-0.5">{f![1]}</sup>);
      r = r.substring(mi + f![0].length); i++;
    }
    return p;
  };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith("```")) { if (inCode) { els.push(<pre key={`c${i}`} className="my-3 p-4 rounded-[10px] bg-primary-dark text-soft-accent text-[13px] font-mono overflow-x-auto"><code>{code.trim()}</code></pre>); code = ""; inCode = false; } else inCode = true; continue; }
    if (inCode) { code += l + "\n"; continue; }
    if (l.startsWith("|")) { const c = l.split("|").filter(x => x.trim()).map(x => x.trim()); if (c.every(x => /^[-:]+$/.test(x))) continue; tbl.push(c); if (!lines[i+1]?.startsWith("|")) { els.push(<div key={`t${i}`} className="my-3 overflow-x-auto"><table className="w-full text-[13px] border-collapse"><thead><tr>{tbl[0].map((x,ci) => <th key={ci} className="text-left px-3 py-2 bg-bg border border-border font-medium text-text-primary">{x}</th>)}</tr></thead><tbody>{tbl.slice(1).map((row,ri) => <tr key={ri}>{row.map((x,ci) => <td key={ci} className="px-3 py-2 border border-border text-text-secondary">{il(x,`t${i}${ri}${ci}`)}</td>)}</tr>)}</tbody></table></div>); tbl = []; } continue; }
    if (l.startsWith("## ")) { els.push(<h2 key={`h${i}`} className="text-[17px] font-semibold text-text-primary mt-6 mb-3">{il(l.slice(3),`h${i}`)}</h2>); continue; }
    if (l.startsWith("### ")) { els.push(<h3 key={`h${i}`} className="text-[15px] font-semibold text-text-primary mt-5 mb-2">{il(l.slice(4),`h${i}`)}</h3>); continue; }
    if (l.startsWith("- ") || l.startsWith("* ")) { els.push(<div key={`l${i}`} className="flex gap-2.5 ml-1 mb-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary/30 mt-[7px] shrink-0"/><span className="text-[14px] text-text-secondary leading-relaxed">{il(l.replace(/^[-*]\s+/,""),`l${i}`)}</span></div>); continue; }
    const nm = l.match(/^(\d+)\.\s+(.*)/);
    if (nm) { els.push(<div key={`o${i}`} className="flex gap-3 ml-1 mb-1.5"><span className="w-5 h-5 rounded-full bg-primary/5 text-primary text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">{nm[1]}</span><span className="text-[14px] text-text-secondary leading-relaxed">{il(nm[2],`o${i}`)}</span></div>); continue; }
    if (!l.trim()) { els.push(<div key={`b${i}`} className="h-2"/>); continue; }
    els.push(<p key={`p${i}`} className="text-[14px] text-text-secondary leading-relaxed mb-2">{il(l,`p${i}`)}</p>);
  }
  return els;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [retrieving, setRetrieving] = useState(false);
  const [showSrc, setShowSrc] = useState(false);
  const [srcs, setSrcs] = useState<Source[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = CHATS.find(c => c.id === activeId);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, retrieving]);

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
      {/* Sidebar */}
      <aside className="w-[260px] h-full flex flex-col bg-surface border-r border-border overflow-hidden shrink-0">
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-primary flex items-center justify-center text-white"><IBrain/></div>
          <span className="text-[15px] font-semibold tracking-tight text-text-primary">NextMind AI</span>
        </div>
        <div className="px-3 mb-2">
          <button onClick={fresh} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-primary text-white text-[13px] font-medium hover:bg-primary-light transition-colors"><IPlus/> New Chat</button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <div className="mb-4">
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold tracking-wider text-text-secondary uppercase"><IChevron d="down"/> Chats</div>
            <div className="mt-0.5 space-y-0.5">
              {CHATS.map(c => (
                <button key={c.id} onClick={() => open(c.id)} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 text-left group ${activeId === c.id ? "bg-primary/5 text-primary font-medium" : "text-text-secondary hover:bg-bg hover:text-text-primary"}`}>
                  <IChat/> <span className="line-clamp-1">{c.title}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold tracking-wider text-text-secondary uppercase"><IChevron d="down"/> Knowledge</div>
            <div className="mt-0.5 space-y-0.5">
              <a href="/knowledge" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-text-secondary hover:bg-bg hover:text-text-primary transition-all"><IDoc/> My Documents</a>
              <a href="/collections" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-text-secondary hover:bg-bg hover:text-text-primary transition-all"><IFolder/> Collections</a>
            </div>
          </div>
        </nav>
        <div className="px-3 pb-4 space-y-2">
          
          <a href="/settings" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-text-secondary hover:bg-bg hover:text-text-primary transition-all"><ISettings/> Settings</a>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 h-full overflow-hidden">
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {activeId && (
            <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface/80 backdrop-blur-sm shrink-0">
              <h1 className="text-[15px] font-semibold text-text-primary">{active?.title}</h1>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"><ISearch/></button>
                <button className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors relative"><IShare/><span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-green border-2 border-surface"/></button>
              </div>
            </header>
          )}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 min-h-full relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.02] blur-3xl"/><div className="absolute top-[20%] right-[15%] w-[300px] h-[300px] rounded-full bg-soft-accent/40 blur-3xl"/></div>
                <div className="relative z-10 flex flex-col items-center max-w-[640px] w-full">
                  <div className="relative mb-8"><div className="w-20 h-20 rounded-[22px] bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-[0_8px_32px_rgba(13,43,35,0.15)]"><svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="6" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="18" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/><circle cx="12" cy="20" r="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".15"/><line x1="12" y1="8.5" x2="7.5" y2="12" stroke="currentColor" strokeWidth="1.5" opacity=".4"/><line x1="12" y1="8.5" x2="16.5" y2="12" stroke="currentColor" strokeWidth="1.5" opacity=".4"/></svg></div><div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent-green border-[3px] border-bg flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white"/></div></div>
                  <h1 className="text-[32px] font-bold tracking-tight text-text-primary mb-3 text-center">Your private AI workspace</h1>
                  <p className="text-[15px] text-text-secondary text-center max-w-[440px] leading-relaxed mb-12">Ask questions, explore your documents, and discover insights — all running locally on your device.</p>
                  <div className="grid grid-cols-2 gap-3 w-full mb-10">
                    {[
                      { Icon: ISearch, t: "Search documents", d: "Find anything across your knowledge base", p: "Search my documents for" },
                      { Icon: IDoc, t: "Analyze a file", d: "Extract insights from your documents", p: "Analyze this document and summarize" },
                      { Icon: IFile, t: "Explain a concept", d: "Get clear answers grounded in your docs", p: "Explain the concept of" },
                      { Icon: IChat, t: "Summarize knowledge", d: "Create summaries from your sources", p: "Summarize the key points about" },
                    ].map((action, i) => {
                      const Icon: React.ComponentType<{className?: string}> = action.Icon;
                      return (
                        <button key={action.t} onClick={() => ask(action.p)} className="group flex items-start gap-3.5 p-4 rounded-[14px] bg-surface border border-border hover:border-primary/20 hover:shadow-[0_4px_20px_rgba(13,43,35,0.06)] transition-all duration-200 text-left animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                          <div className="w-9 h-9 rounded-[10px] bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors"><Icon className="w-4 h-4 text-primary"/></div>
                          <div><div className="text-[13px] font-semibold text-text-primary mb-0.5 group-hover:text-primary transition-colors">{action.t}</div><div className="text-[12px] text-text-secondary leading-snug">{action.d}</div></div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-[768px] mx-auto px-6 py-6 space-y-6">
                {messages.map(m => (
                  <div key={m.id} className={`animate-fade-in ${m.role === "user" ? "flex justify-end" : ""}`}>
                    {m.role === "user" ? (
                      <div className="max-w-[65%] px-4 py-3 rounded-[14px] bg-primary text-white text-[14px] leading-relaxed">{m.content}</div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-[10px] bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 mt-0.5"><IBrain/></div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="text-[13px] font-medium text-primary mb-2">NextMind AI</div>
                          <div>{md(m.content)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {retrieving && <div className="animate-fade-in flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin"/><span className="text-[13px] font-medium text-text-secondary">Searching your knowledge</span></div>}
              </div>
            )}
          </div>
          <div className="px-6 pb-5 pt-2 shrink-0">
            <div className="w-full max-w-[768px] mx-auto bg-surface border border-border rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus-within:border-primary/30 transition-all">
              <textarea placeholder="Ask NextMind anything..." rows={1} className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-[15px] text-text-primary placeholder:text-text-secondary/60 focus:outline-none leading-relaxed" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); const v = (e.target as HTMLTextAreaElement).value.trim(); if (v) { ask(v); (e.target as HTMLTextAreaElement).value = ""; } } }}/>
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"><IAttach/></button>
                  <div className="ml-1 flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg border border-border"><div className="w-1.5 h-1.5 rounded-full bg-accent-green"/><span className="text-[11px] font-medium text-text-secondary">Local LLM</span></div>
                </div>
                <button className="p-2.5 rounded-[10px] bg-bg text-text-secondary/40"><ISend/></button>
              </div>
            </div>
          </div>
        </div>
        {showSrc && srcs.length > 0 && (
          <aside className="w-[320px] h-full border-l border-border bg-surface overflow-hidden flex flex-col shrink-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border"><h2 className="text-[14px] font-semibold text-text-primary">Sources</h2></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {srcs.map(s => (
                <div key={s.id} className="p-4 rounded-[12px] bg-bg border border-border hover:border-primary/20 transition-all cursor-pointer">
                  <div className="flex items-start gap-3 mb-2.5"><div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0"><IFile/></div><div className="min-w-0"><div className="text-[13px] font-medium text-text-primary line-clamp-1">{s.documentName}</div><div className="text-[12px] text-text-secondary mt-0.5">{s.section}</div></div></div>
                  <div className="flex items-center gap-2 mb-2.5"><span className="text-[11px] text-text-secondary">Page {s.page}</span><span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${s.relevance === "High" ? "text-accent-green bg-accent-green/10" : "text-yellow-600 bg-yellow-50"}`}>{s.relevance}</span></div>
                  <p className="text-[12px] text-text-secondary/80 leading-relaxed line-clamp-2">&ldquo;{s.preview}&rdquo;</p>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
