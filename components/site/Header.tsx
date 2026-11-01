"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { LogoInline } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { NAV } from "./nav";


export function Header({ contactEmail, phone }: { contactEmail?: string | null; phone?: string | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
          scrolled ? "border-b border-line/80 bg-ivory/90 py-3 backdrop-blur-md" : "border-b border-transparent bg-transparent py-5 md:py-7"
        )}
      >
        <div className="container-x flex items-center justify-between gap-6">
          <Link href="/" aria-label="VIOR ATELIER, home" className="relative z-[60] text-navy">
            <LogoInline className={cn("w-auto transition-all duration-500", scrolled ? "h-7 md:h-8" : "h-8 md:h-10", open && "text-ivory")} />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn("eyebrow relative py-1 tracking-[0.2em] transition-colors hover:text-navy", isActive(item.href) ? "text-navy" : "text-ink/70")}
              >
                <span className="link-underline">{item.label}</span>
                {isActive(item.href) && <span aria-hidden className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-champagne" />}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/contact" className="hidden border border-navy px-5 py-3 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-navy transition-colors duration-500 hover:bg-navy hover:text-ivory sm:inline-flex">
              Let&apos;s Talk
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={cn("relative z-[60] -mr-2 inline-flex h-11 w-11 items-center justify-center lg:hidden", open ? "text-ivory" : "text-navy")}
            >
              {open ? <X strokeWidth={1.25} className="h-6 w-6" /> : <Menu strokeWidth={1.25} className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-[55] flex flex-col bg-navy text-ivory lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav aria-label="Mobile" className="container-x mt-28 flex flex-1 flex-col">
              {NAV.map((item, i) => (
                <motion.div key={item.href} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                  <Link href={item.href} className="flex items-baseline gap-5 border-b border-ivory/10 py-4">
                    <span className="eyebrow text-champagne/80">0{i + 1}</span>
                    <span className={cn("font-serif text-[2.6rem] leading-none", isActive(item.href) ? "italic text-champagne" : "text-ivory")}>{item.label}</span>
                  </Link>
                </motion.div>
              ))}
              <div className="mt-auto space-y-2 pb-10 pt-8 text-sm text-ivory/70">
                {contactEmail && <a className="block" href={`mailto:${contactEmail}`}>{contactEmail}</a>}
                {phone && <a className="block" href={`tel:${phone.replace(/[^+0-9]/g, "")}`}>{phone}</a>}
                <Link href="/contact" className="mt-6 inline-flex border border-champagne px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.22em] text-champagne">Let&apos;s Talk</Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
