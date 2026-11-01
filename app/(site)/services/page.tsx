import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ContactCta } from "@/components/site/ContactCta";
import { PageHero } from "@/components/site/PageHero";
import { ProcessTimeline } from "@/components/site/ProcessTimeline";
import { Reveal, RevealImage } from "@/components/site/motion";
import { JsonLd } from "@/components/site/ui";
import { getServices } from "@/lib/data/public";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const revalidate = 60;
export const generateMetadata = () => buildMetadata({ path: "/services" });

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={["Focused services,", <span key="i" className="italic text-gold">considered craft.</span>]}
        intro="Three disciplines, one standard. Whether you need a new website, a digital menu or stronger search foundations, every engagement is shaped around your business and delivered with care."
        crumbs={[{ name: "Home", href: "/" }, { name: "Services" }]}
      />
      <section className="py-20 md:py-32">
        <div className="container-x space-y-24 md:space-y-36">
          {services.map((s, i) => (
            <article key={s.id} className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
              <div className={i % 2 ? "md:order-2 md:col-span-6 md:col-start-7" : "md:col-span-6"}>
                <RevealImage className="aspect-[4/3]">
                  {s.image_url ? <Image src={s.image_url} alt={s.image_alt ?? s.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover saturate-[.85]" /> : <div className="h-full w-full bg-stone/50" />}
                </RevealImage>
              </div>
              <div className={i % 2 ? "md:order-1 md:col-span-5" : "md:col-span-5 md:col-start-8"}>
                <Reveal><span className="font-serif text-2xl text-champagne-deep">{String(i + 1).padStart(2, "0")}.</span></Reveal>
                <Reveal delay={0.1}><h2 className="h-serif mt-4 text-[2.4rem] text-navy md:text-[3.2rem]">{s.title}</h2></Reveal>
                <Reveal delay={0.15}><p className="mt-5 text-lg leading-relaxed text-ink/75">{s.summary}</p></Reveal>
                <Reveal delay={0.2}>
                  <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-line pt-8 text-sm text-ink/75 sm:grid-cols-2">
                    {s.scope.map((d) => <li key={d} className="flex items-baseline gap-3"><span aria-hidden className="h-px w-3 shrink-0 translate-y-[-3px] bg-champagne-deep" />{d}</li>)}
                  </ul>
                </Reveal>
                <Reveal delay={0.25}>
                  <Link href={`/services/${s.slug}`} className="eyebrow group mt-10 inline-flex items-center gap-3 border-b border-navy pb-2 text-navy">
                    Learn More <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.5} />
                  </Link>
                </Reveal>
              </div>
            </article>
          ))}
        </div>
      </section>
      <ProcessTimeline />
      <ContactCta />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])} />
    </>
  );
}
