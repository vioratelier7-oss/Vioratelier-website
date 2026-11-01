import type { Metadata } from "next";
import { getSeoPage, getSettings } from "@/lib/data/public";
import { SITE_URL } from "@/lib/env";

type Overrides = { title?: string | null; description?: string | null; image?: string | null; path: string; type?: "website" | "article"; noindex?: boolean };

/** Merges: entity SEO fields (overrides) > SEO Manager row for the path > site defaults. */
export async function buildMetadata(o: Overrides): Promise<Metadata> {
  const [settings, page] = await Promise.all([getSettings(), getSeoPage(o.path)]);
  const title = o.title || page?.meta_title || settings?.default_seo_title || "VIOR ATELIER";
  const description = o.description || page?.meta_description || settings?.default_seo_description || undefined;
  const image = o.image || page?.og_image_url || settings?.default_og_image_url || `${SITE_URL}/og-default.jpg`;
  const canonical = page?.canonical_url || `${SITE_URL}${o.path === "/" ? "" : o.path}`;
  const index = o.noindex ? false : page ? page.robots_index : true;
  const follow = page ? page.robots_follow : true;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: { index, follow },
    openGraph: {
      type: o.type ?? "website",
      url: canonical,
      siteName: settings?.brand_name ?? "VIOR ATELIER",
      title: page?.og_title || title,
      description: page?.og_description || description,
      images: [{ url: image }],
      locale: "en_IN",
    },
    twitter: { card: "summary_large_image", title: page?.og_title || title, description: page?.og_description || description, images: [image] },
  };
}

export function organizationJsonLd(s: { brand_name: string; website_url: string | null; contact_email: string | null; contact_phone: string | null; tagline: string; social_links: unknown }) {
  const sameAs = Array.isArray(s.social_links) ? s.social_links.map((l: { url?: string }) => l?.url).filter(Boolean) : [];
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.brand_name,
    url: s.website_url ?? SITE_URL,
    logo: `${SITE_URL}/brand/logo-primary-navy.png`,
    slogan: s.tagline,
    email: s.contact_email ?? undefined,
    telephone: s.contact_phone ?? undefined,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd(name: string) {
  return { "@context": "https://schema.org", "@type": "WebSite", name, url: SITE_URL };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE_URL}${it.path}` })),
  };
}
