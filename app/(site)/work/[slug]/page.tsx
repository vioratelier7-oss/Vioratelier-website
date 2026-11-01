import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { ContactCta } from "@/components/site/ContactCta";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Reveal, RevealImage, SplitLines } from "@/components/site/motion";
import { Breadcrumbs, Eyebrow, JsonLd, SampleBadge } from "@/components/site/ui";
import { getProject, getProjects } from "@/lib/data/public";
import { SITE_URL } from "@/lib/env";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;
type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try { return (await getProjects()).map((p) => ({ slug: p.slug })); } catch { return []; }
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const data = await getProject(slug);
  if (!data) return {};
  const p = data.project;
  return buildMetadata({ path: `/work/${slug}`, title: p.seo_title || `${p.title} · VIOR ATELIER`, description: p.seo_description || p.short_description, image: p.og_image_url || p.cover_image_url, type: "article" });
}

function Block({ index, label, text }: { index: string; label: string; text: string | null }) {
  if (!text) return null;
  return (
    <div className="grid gap-6 border-t border-line py-14 md:grid-cols-12">
      <div className="md:col-span-4"><Eyebrow index={index}>{label}</Eyebrow></div>
      <Reveal className="md:col-span-8"><p className="whitespace-pre-line text-[1.1rem] leading-[1.85] text-ink/80">{text}</p></Reveal>
    </div>
  );
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const [data, all] = await Promise.all([getProject(slug), getProjects()]);
  if (!data) notFound();
  const { project: p, images } = data;
  const gallery = images.filter((im) => im.image_url !== p.cover_image_url);
  const related = all.filter((x) => x.id !== p.id && x.category?.slug === p.category?.slug).concat(all.filter((x) => x.id !== p.id && x.category?.slug !== p.category?.slug)).slice(0, 2);
  const facts = [
    { k: "Client", v: p.client_name },
    { k: "Category", v: p.category?.name },
    { k: "Completed", v: p.completed_on ? formatDate(p.completed_on, { month: "long", year: "numeric" }) : null },
    { k: "Technologies", v: p.technologies?.length ? p.technologies.join(", ") : null },
  ].filter((f) => f.v);

  return (
    <article>
      <header className="pt-32 md:pt-44">
        <div className="container-x">
          <Reveal className="mb-10"><Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Work", href: "/work" }, { name: p.title }]} /></Reveal>
          <div className="flex flex-wrap items-center gap-4">
            <Eyebrow>{p.category?.name ?? "Case study"}</Eyebrow>
            {p.is_sample && <SampleBadge />}
          </div>
          <h1 className="display mt-8 max-w-5xl text-[3rem] text-navy sm:text-[4.4rem] md:text-[6rem]"><SplitLines lines={[p.title]} delay={0.15} /></h1>
          {p.short_description && <Reveal delay={0.35}><p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink/75">{p.short_description}</p></Reveal>}
        </div>
        {p.cover_image_url && (
          <div className="container-x mt-14 md:mt-20">
            <RevealImage delay={0.3} className="aspect-[16/10] md:aspect-[16/8]">
              <Image src={p.cover_image_url} alt={p.cover_image_alt ?? p.title} fill priority sizes="100vw" className="object-cover saturate-[.85]" />
            </RevealImage>
          </div>
        )}
      </header>

      <section className="py-16 md:py-24">
        <div className="container-x">
          <dl className="grid grid-cols-2 gap-8 border-y border-line py-10 md:grid-cols-4">
            {facts.map((f) => (
              <div key={f.k}>
                <dt className="eyebrow text-muted">{f.k}</dt>
                <dd className="mt-3 text-navy">{f.v}</dd>
              </div>
            ))}
          </dl>
          {p.project_url && (
            <a href={p.project_url} target="_blank" rel="noopener noreferrer" className="eyebrow mt-8 inline-flex items-center gap-2 text-navy"><span className="link-underline">Visit the live site</span><ArrowUpRight className="h-3 w-3" strokeWidth={1.5} /></a>
          )}
          <div className="mt-10">
            <Block index="01" label="Overview" text={p.overview} />
            <Block index="02" label="The challenge" text={p.challenge} />
            <Block index="03" label="Our solution" text={p.solution} />
            {p.results_verified && <Block index="04" label="Results" text={p.results} />}
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="pb-24">
          <div className="container-x grid gap-6 md:grid-cols-2">
            {gallery.map((im, i) => (
              <figure key={im.id} className={gallery.length % 2 === 1 && i === 0 ? "md:col-span-2" : undefined}>
                <RevealImage className={gallery.length % 2 === 1 && i === 0 ? "aspect-[16/9]" : "aspect-[4/5]"}>
                  <Image src={im.image_url} alt={im.alt_text ?? p.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover saturate-[.85]" />
                </RevealImage>
                {im.caption && <figcaption className="mt-3 text-sm text-muted">{im.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="border-t border-line bg-white py-24 md:py-32">
          <div className="container-x">
            <Eyebrow>More work</Eyebrow>
            <div className="mt-12 grid gap-10 md:grid-cols-2">
              {related.map((r) => <ProjectCard key={r.id} project={r} aspect="aspect-[5/4]" />)}
            </div>
          </div>
        </section>
      )}
      <ContactCta />
      <JsonLd data={[
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }, { name: p.title, path: `/work/${p.slug}` }]),
        { "@context": "https://schema.org", "@type": "CreativeWork", name: p.title, description: p.short_description ?? undefined, url: `${SITE_URL}/work/${p.slug}`, image: p.cover_image_url ?? undefined, creator: { "@type": "Organization", name: "VIOR ATELIER" } },
      ]} />
    </article>
  );
}
