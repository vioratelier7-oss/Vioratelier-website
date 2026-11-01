"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, FolderKanban, Images, Layers, Inbox, Quote, PenLine, Search, Settings, Users, LogOut, Menu, X, ExternalLink,
} from "lucide-react";
import { LogoInline } from "@/components/brand/Logo";
import { logoutAction } from "@/lib/admin/actions/auth";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; superOnly?: boolean; badge?: number };

export function AdminNav({ name, email, role, newInquiries }: { name: string; email: string; role: "super_admin" | "editor"; newInquiries: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const groups: { label: string; items: Item[] }[] = [
    { label: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
    {
      label: "Content",
      items: [
        { href: "/admin/projects", label: "Projects", icon: FolderKanban },
        { href: "/admin/services", label: "Services", icon: Layers },
        { href: "/admin/blog", label: "Insights", icon: PenLine },
        { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
        { href: "/admin/media", label: "Media library", icon: Images },
      ],
    },
    {
      label: "Studio",
      items: [
        { href: "/admin/inquiries", label: "Inquiries", icon: Inbox, badge: newInquiries },
        { href: "/admin/seo", label: "SEO", icon: Search },
        { href: "/admin/settings", label: "Settings", icon: Settings, superOnly: true },
        { href: "/admin/users", label: "Users", icon: Users, superOnly: true },
      ],
    },
  ];

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/"));
  const roleLabel = role === "super_admin" ? "Super Admin" : "Editor";

  const panel = (
    <div className="adm-sidebar flex h-full flex-col">
      <div className="flex items-center justify-between px-6 pt-7 pb-6">
        <Link href="/admin" className="block text-[#F6F4EF]" aria-label="VIOR ATELIER dashboard">
          <LogoInline className="h-[26px] w-auto" />
          <span className="mt-2.5 block text-[9.5px] font-semibold uppercase tracking-[0.32em] text-[#C9B78F]">Studio CMS</span>
        </Link>
        <button type="button" className="lg:hidden -mr-2 p-2 text-[#F6F4EF]/70" aria-label="Close menu" onClick={() => setOpen(false)}><X size={20} /></button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-6" aria-label="CMS">
        {groups.map((g) => {
          const items = g.items.filter((i) => !i.superOnly || role === "super_admin");
          if (!items.length) return null;
          return (
            <div key={g.label}>
              <p className="adm-nav-group">{g.label}</p>
              <ul className="space-y-0.5 pl-3">
                {items.map((i) => (
                  <li key={i.href}>
                    <Link href={i.href} className="adm-nav-link" aria-current={isActive(i.href) ? "page" : undefined}>
                      <i.icon size={17} strokeWidth={1.6} />
                      <span className="flex-1">{i.label}</span>
                      {!!i.badge && <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#C9B78F] text-[#1B2438] text-[10.5px] font-bold grid place-items-center">{i.badge}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        <div className="pl-3 mt-6">
          <a href="/" target="_blank" rel="noreferrer" className="adm-nav-link"><ExternalLink size={16} strokeWidth={1.6} /><span>View website</span></a>
        </div>
      </nav>
      <div className="border-t border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#C9B78F]/50 font-serif text-[16px] text-[#C9B78F]">{name.slice(0, 1).toUpperCase()}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-[#F6F4EF]" title={email}>{name}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9B78F]">{roleLabel}</p>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="grid h-9 w-9 place-items-center rounded-lg text-[#F6F4EF]/60 transition hover:bg-white/5 hover:text-[#F6F4EF]" aria-label="Sign out" title="Sign out">
              <LogOut size={16} strokeWidth={1.7} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] lg:block">{panel}</aside>
      {/* mobile top bar */}
      <header className="adm-sidebar sticky top-0 z-40 flex h-14 items-center justify-between px-4 lg:hidden">
        <button type="button" className="-ml-2 p-2 text-[#F6F4EF]" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={22} strokeWidth={1.6} /></button>
        <Link href="/admin" className="text-[#F6F4EF]" aria-label="VIOR ATELIER dashboard">
          <LogoInline className="h-[20px] w-auto" />
        </Link>
        <Link href="/admin/inquiries" className={cn("relative -mr-2 p-2 text-[#F6F4EF]/80")} aria-label={`Inquiries${newInquiries ? `, ${newInquiries} new` : ""}`}>
          <Inbox size={20} strokeWidth={1.6} />
          {!!newInquiries && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#C9B78F]" />}
        </Link>
      </header>
      {open && (
        <>
          <div className="adm-scrim lg:hidden" onClick={() => setOpen(false)} />
          <div className="adm-drawer lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">{panel}</div>
        </>
      )}
    </>
  );
}
