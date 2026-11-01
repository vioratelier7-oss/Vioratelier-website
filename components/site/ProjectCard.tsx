import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/data/public";
import { cn } from "@/lib/utils";
import { SampleBadge } from "./ui";

export function ProjectCard({ project, index, aspect = "aspect-[4/5]", sizes = "(min-width: 1024px) 50vw, 100vw", priority }: { project: Project; index?: number; aspect?: string; sizes?: string; priority?: boolean }) {
  return (
    <Link href={`/work/${project.slug}`} className="group block" aria-label={`View project: ${project.title}`}>
      <div className={cn("relative overflow-hidden bg-stone/40", aspect)}>
        {project.cover_image_url ? (
          <Image
            src={project.cover_image_url}
            alt={project.cover_image_alt ?? project.title}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover saturate-[.82] transition-transform duration-[1.6s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.045]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-serif text-6xl text-stone">VA</div>
        )}
        <div className="absolute inset-0 bg-navy/0 transition-colors duration-700 group-hover:bg-navy/15" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {project.is_sample && <SampleBadge />}
          {project.is_featured && !project.is_sample && (
            <span className="bg-ivory/90 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-navy">Featured</span>
          )}
        </div>
        <span className="absolute bottom-4 right-4 flex h-12 w-12 translate-y-3 items-center justify-center rounded-full bg-ivory text-navy opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
        </span>
      </div>
      <div className="mt-5 flex items-start justify-between gap-6">
        <div>
          <p className="eyebrow text-muted">
            {typeof index === "number" && <span className="mr-3 text-champagne-deep">{String(index + 1).padStart(2, "0")}</span>}
            {project.category?.name ?? "Project"}
            {project.client_name && <span className="normal-case tracking-normal text-ink/70"> · {project.client_name}</span>}
          </p>
          <h3 className="h-serif mt-3 text-[1.75rem] text-navy md:text-[2rem]">{project.title}</h3>
          {project.short_description && <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-ink/70">{project.short_description}</p>}
        </div>
      </div>
      <span className="eyebrow mt-4 inline-flex items-center gap-2 text-navy">
        <span className="link-underline">View Project</span>
        <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
      </span>
    </Link>
  );
}
