import { ContactCta } from "@/components/site/ContactCta";
import { PageHero } from "@/components/site/PageHero";
import { ProjectExplorer } from "@/components/site/ProjectExplorer";
import { JsonLd } from "@/components/site/ui";
import { Monogram } from "@/components/brand/Logo";
import { getProjectCategories, getProjects } from "@/lib/data/public";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const revalidate = 60;
export const generateMetadata = () => buildMetadata({ path: "/work" });

export default async function WorkPage() {
  const [projects, categories] = await Promise.all([getProjects(), getProjectCategories()]);
  const hasSamples = projects.some((p) => p.is_sample);
  return (
    <>
      <PageHero
        eyebrow="Work"
        title={["Selected work &", <span key="i" className="italic text-gold">case studies.</span>]}
        intro="A closer look at the websites, digital menus and search foundations we design and build, and the thinking behind them."
        crumbs={[{ name: "Home", href: "/" }, { name: "Work" }]}
      />
      <section className="pb-24 pt-16 md:pb-36 md:pt-24">
        <div className="container-x">
          {hasSamples && (
            <p className="mb-10 border-l border-champagne pl-4 text-sm text-muted">
              Projects marked <span className="text-champagne-deep">Sample · Placeholder</span> are layout examples, not client work. They will be replaced with genuine case studies.
            </p>
          )}
          {projects.length ? (
            <ProjectExplorer projects={projects} categories={categories} />
          ) : (
            <div className="flex flex-col items-center border border-dashed border-stone py-28 text-center">
              <Monogram className="h-12 w-auto text-stone" />
              <p className="mt-6 font-serif text-2xl italic text-navy">Case studies are on their way.</p>
            </div>
          )}
        </div>
      </section>
      <ContactCta />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }])} />
    </>
  );
}
