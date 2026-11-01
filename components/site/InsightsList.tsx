"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { BlogCategory, BlogPost } from "@/lib/data/public";
import { cn } from "@/lib/utils";
import { PostCard } from "./PostCard";

export function InsightsList({ posts, categories }: { posts: BlogPost[]; categories: BlogCategory[] }) {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const used = categories.filter((c) => posts.some((p) => p.category?.slug === c.slug));
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return posts.filter((p) => (cat === "all" || p.category?.slug === cat) && (!n || `${p.title} ${p.excerpt ?? ""}`.toLowerCase().includes(n)));
  }, [posts, cat, q]);
  return (
    <div>
      <div className="flex flex-col gap-6 border-b border-line pb-6 md:flex-row md:items-center md:justify-between">
        <div className="-mx-1 flex flex-wrap gap-2" role="tablist" aria-label="Filter articles by category">
          {[{ slug: "all", name: "All" }, ...used].map((c) => (
            <button key={c.slug} role="tab" aria-selected={cat === c.slug} onClick={() => setCat(c.slug)}
              className={cn("eyebrow border px-4 py-2.5 transition-colors", cat === c.slug ? "border-navy bg-navy text-ivory" : "border-line text-ink/70 hover:border-navy hover:text-navy")}>{c.name}</button>
          ))}
        </div>
        <label className="relative flex items-center md:w-72">
          <span className="sr-only">Search articles</span>
          <Search aria-hidden className="pointer-events-none absolute left-0 h-4 w-4 text-muted" strokeWidth={1.5} />
          <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Search insights" className="w-full border-b border-line bg-transparent py-2.5 pl-7 text-sm text-navy placeholder:text-muted focus:border-navy focus:outline-none" />
        </label>
      </div>
      {list.length === 0 ? <p className="py-24 text-center font-serif text-2xl italic text-muted">No articles match that yet.</p> : (
        <ul className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => <li key={p.id}><PostCard post={p} /></li>)}
        </ul>
      )}
    </div>
  );
}
