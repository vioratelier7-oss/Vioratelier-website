"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { reorderServicesAction } from "@/lib/admin/actions/services";
import { toast } from "@/components/admin/forms";
import { StatusPill } from "@/components/admin/StatusPill";

type Row = { id: string; title: string; slug: string; summary: string | null; status: string; image_url: string | null };

export function ServiceOrderList({ rows: initial }: { rows: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [drag, setDrag] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const save = (next: Row[]) => {
    setRows(next);
    start(async () => {
      const r = await reorderServicesAction(next.map((x) => x.id));
      toast(r.message, r.ok);
      if (!r.ok) setRows(initial);
    });
  };
  const move = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= rows.length) return; const c = [...rows]; [c[i], c[j]] = [c[j], c[i]]; save(c); };
  return (
    <ul className="adm-card adm-divide overflow-hidden" aria-busy={pending}>
      {rows.map((r, i) => (
        <li key={r.id} draggable
          onDragStart={() => setDrag(r.id)}
          onDragOver={(e) => { e.preventDefault(); if (!drag || drag === r.id) return; setRows((xs) => { const from = xs.findIndex((x) => x.id === drag); const c = [...xs]; const [m] = c.splice(from, 1); c.splice(i, 0, m); return c; }); }}
          onDragEnd={() => { setDrag(null); save(rows); }}
          className={`flex items-center gap-3 px-4 py-4 sm:px-5 ${drag === r.id ? "bg-[#FAF8F3] opacity-70" : ""}`} data-testid="service-row">
          <GripVertical size={16} className="hidden shrink-0 cursor-grab text-[#C3BDB1] sm:block" aria-hidden />
          <span className="w-6 text-center font-serif text-[1.15rem] text-[#A8946A]">{String(i + 1).padStart(2, "0")}</span>
          <span className="hidden h-12 w-16 shrink-0 overflow-hidden rounded-md bg-[#F4F1EA] sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {r.image_url && <img src={r.image_url} alt="" className="h-full w-full object-cover" />}
          </span>
          <Link href={`/admin/services/${r.id}`} className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-[#1B2438] hover:underline">{r.title}</span>
            <span className="block truncate text-[12.5px] adm-muted">{r.summary || `/services/${r.slug}`}</span>
          </Link>
          <span className="max-sm:hidden"><StatusPill status={r.status} /></span>
          <div className="flex gap-1">
            <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm" onClick={() => move(i, -1)} disabled={i === 0 || pending} aria-label={`Move ${r.title} up`}><ArrowUp size={14} /></button>
            <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm" onClick={() => move(i, 1)} disabled={i === rows.length - 1 || pending} aria-label={`Move ${r.title} down`}><ArrowDown size={14} /></button>
          </div>
        </li>
      ))}
    </ul>
  );
}
