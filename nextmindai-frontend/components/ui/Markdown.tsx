"use client";

import React from "react";

export function renderMarkdown(s: string) {
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
