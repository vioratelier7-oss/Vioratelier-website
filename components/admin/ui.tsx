import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, description, actions, back }: { eyebrow?: string; title: string; description?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {back && <Link href={back.href} className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium adm-muted hover:text-[#1B2438]">← {back.label}</Link>}
        {eyebrow && <p className="adm-eyebrow mb-3">{eyebrow}</p>}
        <h1 className="adm-title">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-[14px] adm-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className, pad = true }: { children: ReactNode; className?: string; pad?: boolean }) {
  return <div className={cn("adm-card", pad && "adm-card-pad", className)}>{children}</div>;
}

export function SectionTitle({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="adm-h2">{title}</h2>
        {description && <p className="mt-1 text-[13px] adm-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("adm-badge", status === "published" ? "adm-badge-published" : "adm-badge-draft")}>{status === "published" ? "Published" : "Draft"}</span>;
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "featured" | "sample" | "new" | "danger" | "published" | "draft" }) {
  return <span className={cn("adm-badge", tone !== "default" && `adm-badge-${tone}`)}>{children}</span>;
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="adm-empty">
      {icon && <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-[#E4DFD5] bg-white text-[#A8946A]">{icon}</div>}
      <p className="font-serif text-[1.35rem] text-[#1B2438]">{title}</p>
      {body && <p className="mx-auto mt-1.5 max-w-sm text-[13px] adm-muted">{body}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function LinkButton({ href, children, variant = "default", className, size }: { href: string; children: ReactNode; variant?: "primary" | "default" | "gold" | "ghost"; className?: string; size?: "sm" }) {
  return (
    <Link href={href} className={cn("adm-btn", variant === "primary" && "adm-btn-primary", variant === "gold" && "adm-btn-gold", variant === "ghost" && "adm-btn-ghost", size === "sm" && "adm-btn-sm", className)}>
      {children}
    </Link>
  );
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} d ago`;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(iso));
}

export function dateTime(iso: string | null | undefined) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date(iso));
}
