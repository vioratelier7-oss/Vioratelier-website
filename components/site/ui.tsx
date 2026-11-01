import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type BtnProps = { href: string; children: React.ReactNode; variant?: "primary" | "outline" | "light" | "ghost"; className?: string; external?: boolean };

export function ButtonLink({ href, children, variant = "primary", className, external }: BtnProps) {
  const base = "group inline-flex items-center justify-center gap-3 px-7 py-4 text-[0.72rem] font-medium uppercase tracking-[0.22em] transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]";
  const styles = {
    primary: "bg-navy text-ivory hover:bg-navy-soft",
    outline: "border border-navy/80 text-navy hover:bg-navy hover:text-ivory",
    light: "border border-ivory/50 text-ivory hover:bg-ivory hover:text-navy",
    ghost: "px-0 text-navy",
  }[variant];
  const content = (
    <>
      <span>{children}</span>
      <ArrowUpRight aria-hidden className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.5} />
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn(base, styles, className)}>{content}</a>
  ) : (
    <Link href={href} className={cn(base, styles, className)}>{content}</Link>
  );
}

export function Eyebrow({ index, children, className, light }: { index?: string; children: React.ReactNode; className?: string; light?: boolean }) {
  return (
    <div className={cn("eyebrow flex items-center gap-4", light ? "text-champagne" : "text-champagne-deep", className)}>
      {index && <span className={light ? "text-ivory/60" : "text-muted"}>{index}</span>}
      <span className={cn("h-px w-10", light ? "bg-champagne/60" : "bg-champagne")} />
      <span>{children}</span>
    </div>
  );
}

export function SampleBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 border border-champagne/70 bg-ivory/90 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-champagne-deep backdrop-blur", className)}>
      Sample · Placeholder
    </span>
  );
}

export function Breadcrumbs({ items }: { items: Array<{ name: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="eyebrow text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            {it.href ? <Link href={it.href} className="link-underline hover:text-navy">{it.name}</Link> : <span aria-current="page" className="text-navy">{it.name}</span>}
            {i < items.length - 1 && <span aria-hidden className="text-stone">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
