import Image from "next/image";
import Link from "next/link";
import { ContactCta } from "@/components/site/ContactCta";
import { PageHero } from "@/components/site/PageHero";
import { ProcessTimeline } from "@/components/site/ProcessTimeline";
import { Parallax, Reveal, RevealImage } from "@/components/site/motion";
import { Eyebrow, JsonLd } from "@/components/site/ui";
import { getServices } from "@/lib/data/public";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import doors from "@/public/images/about-doors.jpg";
import arch from "@/public/images/about-arch.jpg";

export const revalidate = 60;
export const generateMetadata = () => buildMetadata({ path: "/about" });

const VALUES = [
  { title: "Intention", body: "Every element earns its place. We design with a clear reason behind each decision, never decoration for its own sake." },
  { title: "Precision", body: "Typography, spacing, performance and code are refined to a high standard, because quality lives in the details." },
  { title: "Honesty", body: "Clear advice, realistic timelines and no inflated promises. We only say what we can stand behind." },
  { title: "Partnership", body: "We work alongside you, explain our thinking and stay available long after launch." },
];

export default async function AboutPage() {
  const services = await getServices();
  return (
    <>
      <PageHero
        eyebrow="About the studio"
        title={["Good Design Goes", <span key="i" className="italic text-gold">Beyond Appearance.</span>]}
        crumbs={[{ name: "Home", href: "/" }, { name: "About" }]}
      />
      <section className="py-16 md:py-24">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <RevealImage className="aspect-[4/3]">
              <Parallax className="h-full w-full" offset={40}>
                <Image src={doors} alt="A calm white interior with tall doors" fill placeholder="blur" sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
              </Parallax>
            </RevealImage>
          </div>
          <div className="md:col-span-4 md:col-start-9 md:self-end">
            <Reveal><Eyebrow index="01">Introduction</Eyebrow></Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 text-[1.05rem] leading-relaxed text-ink/80">
                VIOR ATELIER is an independent digital studio. We design and build websites, digital menus and search foundations for small and growing businesses, cafés and restaurants, hospitality brands, startups and entrepreneurs.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 md:py-36">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4"><Reveal><Eyebrow index="02">Philosophy</Eyebrow></Reveal></div>
          <div className="md:col-span-8">
            <Reveal>
              <p className="h-serif text-[2rem] text-navy md:text-[3rem]">
                We believe every digital experience should have a purpose. Our approach combines <span className="italic text-gold">thoughtful aesthetics</span>, practical technology and business understanding to create meaningful digital solutions.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-36">
        <div className="container-x">
          <Reveal><Eyebrow index="03">Core values</Eyebrow></Reveal>
          <ul className="mt-14 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal as="li" key={v.title} delay={i * 0.08} className="bg-ivory p-8 md:p-10">
                <span className="font-serif text-lg text-champagne-deep">0{i + 1}</span>
                <h3 className="h-serif mt-10 text-[2rem] text-navy">{v.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/70">{v.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="pb-24 md:pb-36">
        <div className="container-x grid items-center gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal><Eyebrow index="04">Working approach</Eyebrow></Reveal>
            <Reveal delay={0.1}><h2 className="h-serif mt-8 text-[2.4rem] text-navy md:text-[3.2rem]">Small studio. <span className="italic">Close collaboration.</span></h2></Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 leading-relaxed text-ink/75">Working with an independent studio means direct conversations with the people designing and building your project. We keep the process transparent: you see the direction early, give feedback at every stage and always know what happens next.</p>
            </Reveal>
            <Reveal delay={0.25}>
              <ul className="mt-10 border-t border-line">
                {services.map((s, i) => (
                  <li key={s.id} className="border-b border-line">
                    <Link href={`/services/${s.slug}`} className="group flex items-baseline justify-between gap-6 py-5">
                      <span className="flex items-baseline gap-4"><span className="font-serif text-champagne-deep">0{i + 1}</span><span className="h-serif text-xl text-navy transition-transform duration-500 group-hover:translate-x-1.5">{s.title}</span></span>
                      <span className="eyebrow text-muted">View</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <RevealImage className="aspect-[4/5]">
              <Image src={arch} alt="A soft arched mirror in a neutral room" fill placeholder="blur" sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </RevealImage>
          </div>
        </div>
      </section>
      <ProcessTimeline index="05" />
      <ContactCta />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
    </>
  );
}
