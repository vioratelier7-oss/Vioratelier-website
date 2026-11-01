"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import type { Project, ProjectCategory } from "@/lib/data/public";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";

/** Category filter + search over the published projects already fetched from the database. */
export function ProjectExplorer({ projects, categories, showSearch = true, layout = "grid" }: { projects: Project[]; categories: ProjectCategory[]; showSearch?: boolean; layout?: "grid" | "editorial" }) {
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const usedCats = categories.filter((c) => projects.some((p) => p.category?.slug === c.slug));
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return projects.filter((p) => (cat === "all" || p.category?.slug === cat) &&
      (!needle || [p.title, p.client_name, p.short_description, p.category?.name, ...(p.technologies ?? [])].filter(Boolean).join(" ").toLowerCase().includes(needle)));
  }, [projects, cat, q]);

  return (
    <div>
      <div className="flex flex-col gap-6 border-b border-line pb-6 md:flex-row md:items-center md:justify-between">
        <div role="tablist" aria-label="Filter projects by category" className="-mx-1 flex flex-wrap gap-2">
          {[{ slug: "all", name: "All" }, ...usedCats].map((c) => (
            <button
              key={c.slug}
              role="tab"
              aria-selected={cat === c.slug}
              onClick={() => setCat(c.slug)}
              className={cn("eyebrow border px-4 py-2.5 transition-colors duration-300", cat === c.slug ? "border-navy bg-navy text-ivory" : "border-line text-ink/70 hover:border-navy hover:text-navy")}
            >
              {c.name}
            </button>
          ))}
        </div>
        {showSearch && (
          <label className="relative flex items-center md:w-72">
            <span className="sr-only">Search projects</span>
            <Search aria-hidden className="pointer-events-none absolute left-0 h-4 w-4 text-muted" strokeWidth={1.5} />
            <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Search projects" className="w-full border-b border-line bg-transparent py-2.5 pl-7 text-sm text-navy placeholder:text-muted focus:border-navy focus:outline-none" />
          </label>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="py-24 text-center font-serif text-2xl italic text-muted">No projects match that yet.</p>
      ) : (
        <motion.ul layout className={cn("mt-12 grid gap-x-8 gap-y-16 md:mt-16", layout === "editorial" ? "md:grid-cols-12" : "sm:grid-cols-2 lg:grid-cols-3")}>
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 6) * 0.06 }}
                className={layout === "editorial" ? (i % 4 === 0 || i % 4 === 3 ? "md:col-span-7" : "md:col-span-5 md:pt-24") : undefined}
              >
                <ProjectCard project={p} index={i} aspect={layout === "editorial" ? (i % 4 === 0 || i % 4 === 3 ? "aspect-[5/4]" : "aspect-[4/5]") : "aspect-[4/5]"} sizes={layout === "editorial" ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}
