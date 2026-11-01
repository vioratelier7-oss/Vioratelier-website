"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export function SocialLinks({ name, defaultValue }: { name: string; defaultValue: { label: string; url: string }[] }) {
  const [items, setItems] = useState(defaultValue.map((s, i) => ({ ...s, k: String(i) })));
  return (
    <div className="space-y-2.5">
      <input type="hidden" name={name} value={JSON.stringify(items.map(({ label, url }) => ({ label, url })))} />
      {items.length === 0 && <p className="text-[13px] adm-muted">No social profiles added. The website hides the social icons until you add real ones.</p>}
      {items.map((s) => (
        <div key={s.k} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[180px_1fr_auto]">
          <input value={s.label} maxLength={40} onChange={(e) => setItems((xs) => xs.map((x) => (x.k === s.k ? { ...x, label: e.target.value } : x)))} className="adm-input max-sm:col-span-1" placeholder="Instagram" aria-label="Label" />
          <input value={s.url} maxLength={500} onChange={(e) => setItems((xs) => xs.map((x) => (x.k === s.k ? { ...x, url: e.target.value } : x)))} className="adm-input max-sm:order-3 max-sm:col-span-2" placeholder="https://instagram.com/…" aria-label="URL" />
          <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-danger" onClick={() => setItems((xs) => xs.filter((x) => x.k !== s.k))} aria-label="Remove link"><Trash2 size={15} /></button>
        </div>
      ))}
      <button type="button" className="adm-btn adm-btn-sm" onClick={() => setItems((xs) => [...xs, { label: "", url: "", k: Math.random() + "" }])}><Plus size={14} /> Add social link</button>
    </div>
  );
}
