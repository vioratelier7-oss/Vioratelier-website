import Link from "next/link";
import { LogoPrimary } from "@/components/brand/Logo";
import type { Service, Settings } from "@/lib/data/public";
import { telHref } from "@/lib/utils";
import { NAV } from "./nav";

export function Footer({ settings, services }: { settings: Settings | null; services: Service[] }) {
  const socials = Array.isArray(settings?.social_links) ? (settings!.social_links as Array<{ label?: string; url?: string }>).filter((s) => s?.url && s?.label) : [];
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-navy text-ivory/80">
      <div className="container-x pt-20 md:pt-28">
        <div className="grid gap-14 border-b border-ivory/10 pb-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link href="/" aria-label="VIOR ATELIER, home" className="inline-block text-champagne">
              <LogoPrimary className="h-36 w-auto" />
            </Link>
            <p className="mt-8 font-serif text-2xl italic text-ivory">{settings?.tagline ?? "Crafting Digital Experiences."}</p>
            {settings?.intro && <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory/60">{settings.intro}</p>}
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-8 md:pl-10">
            <div>
              <h2 className="eyebrow mb-6 text-champagne">Studio</h2>
              <ul className="space-y-3 text-sm">
                {NAV.map((n) => <li key={n.href}><Link className="link-underline hover:text-ivory" href={n.href}>{n.label}</Link></li>)}
              </ul>
            </div>
            <div>
              <h2 className="eyebrow mb-6 text-champagne">Services</h2>
              <ul className="space-y-3 text-sm">
                {services.map((s) => <li key={s.id}><Link className="link-underline hover:text-ivory" href={`/services/${s.slug}`}>{s.title}</Link></li>)}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h2 className="eyebrow mb-6 text-champagne">Contact</h2>
              <ul className="space-y-3 text-sm">
                {settings?.contact_phone && <li><a className="link-underline hover:text-ivory" href={telHref(settings.contact_phone)}>{settings.contact_phone}</a></li>}
                {settings?.contact_email && <li><a className="link-underline break-all hover:text-ivory" href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a></li>}
                {settings?.website_url && <li><a className="link-underline hover:text-ivory" href={settings.website_url}>{settings.website_url.replace(/^https?:\/\//, "")}</a></li>}
              </ul>
              {socials.length > 0 && (
                <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                  {socials.map((s) => <li key={s.url}><a className="link-underline hover:text-ivory" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 py-8 text-xs text-ivory/50 md:flex-row md:items-center md:justify-between">
          <p>© {year} {settings?.brand_name ?? "VIOR ATELIER"}. All rights reserved.</p>
          <p className="font-serif text-sm italic text-ivory/60">{settings?.footer_text ?? "Design with intention. Build with precision. Create with purpose."}</p>
          <div className="flex gap-6">
            <Link className="link-underline hover:text-ivory" href="/privacy">Privacy Policy</Link>
            <Link className="link-underline hover:text-ivory" href="/terms">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
