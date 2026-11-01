import { ContactCta } from "@/components/site/ContactCta";
import { InsightsList } from "@/components/site/InsightsList";
import { PageHero } from "@/components/site/PageHero";
import { PostCard } from "@/components/site/PostCard";
import { Reveal } from "@/components/site/motion";
import { JsonLd } from "@/components/site/ui";
import { Monogram } from "@/components/brand/Logo";
import { getBlogCategories, getPosts } from "@/lib/data/public";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const revalidate = 60;
export const generateMetadata = () => buildMetadata({ path: "/insights" });

export default async function InsightsPage() {
  const [posts, categories] = await Promise.all([getPosts(), getBlogCategories()]);
  const featured = posts.find((p) => p.is_featured) ?? posts[0];
  return (
    <>
      <PageHero eyebrow="Insights" title={["Notes on design,", <span key="i" className="italic text-gold">digital & growth.</span>]}
        intro="Practical thinking on websites, hospitality, search and the craft of building for the web."
        crumbs={[{ name: "Home", href: "/" }, { name: "Insights" }]} />
      <section className="pb-24 pt-16 md:pb-36 md:pt-24">
        <div className="container-x">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center border border-dashed border-stone py-28 text-center">
              <Monogram className="h-12 w-auto text-stone" />
              <p className="mt-6 font-serif text-2xl italic text-navy">The first articles are being written.</p>
            </div>
          ) : (
            <>
              {featured && <Reveal className="mb-20 md:mb-28"><div className="md:w-4/5"><PostCard post={featured} large /></div></Reveal>}
              <InsightsList posts={posts.filter((p) => p.id !== featured?.id)} categories={categories} />
            </>
          )}
        </div>
      </section>
      <ContactCta />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Insights", path: "/insights" }])} />
    </>
  );
}
