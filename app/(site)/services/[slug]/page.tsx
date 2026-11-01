import Image from "next/image";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { ContactCta } from "@/components/site/ContactCta";
import { FaqList } from "@/components/site/Faq";
import { ProcessTimeline } from "@/components/site/ProcessTimeline";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Reveal, RevealImage, SplitLines } from "@/components/site/motion";
import { Breadcrumbs, ButtonLink, Eyebrow, JsonLd } from "@/components/site/ui";
import { asFaqs, getProjects, getService, getServices, getSettings } from "@/lib/data/public";
import { SITE_URL } from "@/lib/env";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try { return (await getServices()).map((s) => ({ slug: s.slug })); } catch { return []; }
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return {};
  return buildMetadata({ path: `/services/${slug}`, title: s.seo_title || `${s.title} · VIOR ATELIER`, description: s.seo_description || s.summary, image: s.og_image_url || s.image_url });
}

// Which project categories illustrate which service (portfolio examples on each service page).
const RELATED: Record<string, string[]> = {
  "website-design-development": ["websites", "branding"],
  "qr-code-menu-solutions": ["qr-menus"],
  "seo-setup-optimisation": ["seo", "websites"],
};

export default async function ServicePage({ params }: Params) {
  const { slug } = await params;
  const [service, settings, projects] = await Promise.all([getService(slug), getSettings(), getProjects()]);
  if (!service) notFound();
  const faqs = asFaqs(service.faqs);
  const related = projects.filter((p) => p.category && (RELATED[slug] ?? []).includes(p.category.slug)).slice(0, 2);

  return (
    <>
      <section className="pt-32 md:pt-44">
        <div className="container-x">
          <Reveal className="mb-10"><Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Services", href: "/services" }, { name: service.title }]} /></Reveal>
          <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <Reveal><Eyebrow>{service.title}</Eyebrow></Reveal>
              <h1 className="display mt-8 text-[2.9rem] text-navy sm:text-[4rem] md:text-[5rem]">
                <SplitLines lines={[service.hero_heading ?? service.title]} delay={0.15} />
              </h1>
              <Reveal delay={0.35}><p className="mt-8 max-w-xl text-lg leading-relaxed text-ink/75">{service.summary}</p></Reveal>
              <Reveal delay={0.45} className="mt-10 flex flex-wrap gap-4">
                <ButtonLink href="/contact#inquiry">Start a Project</ButtonLink>
                <ButtonLink href="#faq" variant="outline">Questions</ButtonLink>
              </Reveal>
            </div>
            <div className="lg:col-span-5">
              <RevealImage delay={0.2} className="aspect-[4/5]">
                {service.image_url ? <Image src={service.image_url} alt={service.image_alt ?? service.title} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover saturate-[.85]" /> : <div className="h-full w-full bg-stone/50" />}
              </RevealImage>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4"><Reveal><Eyebrow index="01">Overview</Eyebrow></Reveal></div>
          <div className="md:col-span-8">
            <Reveal><p className="h-serif text-[1.7rem] text-navy md:text-[2.3rem]">{service.overview}</p></Reveal>
            <Reveal delay={0.1}>
              <ul className="mt-12 flex flex-wrap gap-3">
                {service.scope.map((s) => <li key={s} className="border border-line px-4 py-2 text-sm text-ink/80">{s}</li>)}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 md:py-32">
        <div className="container-x grid gap-16 md:grid-cols-2 md:gap-20">
          <div>
            <Reveal><Eyebrow index="02">Problems we solve</Eyebrow></Reveal>
            <ul className="mt-10 border-t border-line">
              {service.problems.map((p, i) => (
                <Reveal as="li" key={p} delay={i * 0.05} className="flex gap-6 border-b border-line py-6">
                  <span className="font-serif text-lg text-champagne-deep">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[1.02rem] leading-relaxed text-ink/80">{p}</span>
                </Reveal>
              ))}
            </ul>
          </div>
          <div>
            <Reveal><Eyebrow index="03">Benefits</Eyebrow></Reveal>
            <ul className="mt-10 border-t border-line">
              {service.benefits.map((b, i) => (
                <Reveal as="li" key={b} delay={i * 0.05} className="flex gap-6 border-b border-line py-6">
                  <Check aria-hidden className="mt-1 h-4 w-4 shrink-0 text-champagne-deep" strokeWidth={1.5} />
                  <span className="text-[1.02rem] leading-relaxed text-ink/80">{b}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Reveal><Eyebrow index="04">Deliverables</Eyebrow></Reveal>
            <Reveal delay={0.1}><h2 className="h-serif mt-8 text-[2.4rem] text-navy md:text-[3rem]">What you <span className="italic">receive</span></h2></Reveal>
          </div>
          <ol className="grid gap-px bg-line sm:grid-cols-2 md:col-span-8">
            {service.deliverables.map((d, i) => (
              <Reveal as="li" key={d} delay={(i % 2) * 0.08} className="flex min-h-36 flex-col justify-between bg-ivory p-7">
                <span className="eyebrow text-champagne-deep">{String(i + 1).padStart(2, "0")}</span>
                <span className="h-serif mt-6 text-[1.45rem] text-navy">{d}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <ProcessTimeline index="05" />

      {related.length > 0 && (
        <section className="py-24 md:py-32">
          <div className="container-x">
            <Reveal><Eyebrow index="06">Related work</Eyebrow></Reveal>
            <div className="mt-12 grid gap-10 md:grid-cols-2">
              {related.map((p) => <ProjectCard key={p.id} project={p} aspect="aspect-[5/4]" />)}
            </div>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section id="faq" className="scroll-mt-28 bg-white py-24 md:py-32">
          <div className="container-x grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <Reveal><Eyebrow index="07">FAQ</Eyebrow></Reveal>
              <Reveal delay={0.1}><h2 className="h-serif mt-8 text-[2.4rem] text-navy md:text-[3rem]">Frequently asked <span className="italic">questions</span></h2></Reveal>
            </div>
            <div className="md:col-span-8"><FaqList items={faqs} /></div>
          </div>
        </section>
      )}

      <ContactCta />
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: service.title, path: `/services/${slug}` }]),
          { "@context": "https://schema.org", "@type": "Service", name: service.title, description: service.summary, serviceType: service.title, url: `${SITE_URL}/services/${slug}`,
            provider: { "@type": "Organization", name: settings?.brand_name ?? "VIOR ATELIER", url: settings?.website_url ?? SITE_URL } },
          ...(faqs.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
        ]}
      />
    </>
  );
}
