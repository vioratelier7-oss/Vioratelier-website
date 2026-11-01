"use client";
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

export function FaqRepeater({ name, defaultValue }: { name: string; defaultValue: { q: string; a: string }[] }) {
  const [items, setItems] = useState(defaultValue.map((f, i) => ({ ...f, k: i + "-" + Math.random() })));
  const move = (i: number, d: number) => setItems((xs) => { const j = i + d; if (j < 0 || j >= xs.length) return xs; const c = [...xs]; [c[i], c[j]] = [c[j], c[i]]; return c; });
  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(items.map(({ q, a }) => ({ q, a })))} />
      {items.map((f, i) => (
        <div key={f.k} className="rounded-lg border border-[#E4DFD5] bg-[#FCFBF8] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A8946A]">Question {i + 1}</span>
            <div className="flex gap-1">
              <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><ArrowUp size={14} /></button>
              <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down"><ArrowDown size={14} /></button>
              <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm adm-btn-danger" onClick={() => setItems((xs) => xs.filter((x) => x.k !== f.k))} aria-label="Remove question"><Trash2 size={14} /></button>
            </div>
          </div>
          <input value={f.q} maxLength={300} onChange={(e) => setItems((xs) => xs.map((x) => (x.k === f.k ? { ...x, q: e.target.value } : x)))} className="adm-input mb-2 !font-semibold" placeholder="Question" aria-label={`Question ${i + 1}`} />
          <textarea value={f.a} maxLength={3000} rows={3} onChange={(e) => setItems((xs) => xs.map((x) => (x.k === f.k ? { ...x, a: e.target.value } : x)))} className="adm-textarea !min-h-[80px]" placeholder="Answer" aria-label={`Answer ${i + 1}`} />
        </div>
      ))}
      <button type="button" className="adm-btn adm-btn-sm" onClick={() => setItems((xs) => [...xs, { q: "", a: "", k: Math.random() + "" }])}><Plus size={14} /> Add question</button>
    </div>
  );
}
