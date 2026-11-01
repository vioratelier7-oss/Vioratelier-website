import Image from "next/image";
import { notFound } from "next/navigation";
import { ContactCta } from "@/components/site/ContactCta";
import { PostCard } from "@/components/site/PostCard";
import { Reveal, RevealImage, SplitLines } from "@/components/site/motion";
import { Breadcrumbs, Eyebrow, JsonLd } from "@/components/site/ui";
import { ShareLinks } from "@/components/site/ShareLinks";
import { getPost, getPosts, getSettings } from "@/lib/data/public";
import { SITE_URL } from "@/lib/env";
import { sanitizeArticle } from "@/lib/sanitize";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;
type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try { return (await getPosts()).map((p) => ({ slug: p.slug })); } catch { return []; }
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p) return {};
  return buildMetadata({ path: `/insights/${slug}`, title: p.seo_title || `${p.title} · VIOR ATELIER`, description: p.seo_description || p.excerpt, image: p.og_image_url || p.cover_image_url, type: "article" });
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const [post, all, settings] = await Promise.all([getPost(slug), getPosts(), getSettings()]);
  if (!post) notFound();
  const related = all.filter((p) => p.id !== post.id && p.category?.slug === post.category?.slug).concat(all.filter((p) => p.id !== post.id && p.category?.slug !== post.category?.slug)).slice(0, 3);
  const url = `${SITE_URL}/insights/${post.slug}`;
  return (
    <>
      <article>
        <header className="pt-32 md:pt-44">
          <div className="container-x max-w-5xl">
            <Reveal className="mb-10"><Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Insights", href: "/insights" }, { name: post.title }]} /></Reveal>
            <Reveal><Eyebrow>{post.category?.name ?? "Insight"}</Eyebrow></Reveal>
            <h1 className="display mt-8 text-[2.7rem] text-navy sm:text-[3.8rem] md:text-[4.8rem]"><SplitLines lines={[post.title]} delay={0.15} /></h1>
            <Reveal delay={0.3}>
              <p className="eyebrow mt-10 flex flex-wrap gap-x-6 gap-y-2 text-muted">
                <span>By {post.author_name ?? "VIOR ATELIER"}</span>
                <span>{formatDate(post.published_at)}</span>
                <span>{post.reading_minutes} min read</span>
              </p>
            </Reveal>
          </div>
          {post.cover_image_url && (
            <div className="container-x mt-14">
              <RevealImage delay={0.2} className="aspect-[16/9] md:aspect-[16/7]">
                <Image src={post.cover_image_url} alt={post.cover_image_alt ?? post.title} fill priority sizes="100vw" className="object-cover saturate-[.85]" />
              </RevealImage>
            </div>
          )}
        </header>
        <div className="container-x grid gap-12 py-16 md:grid-cols-12 md:py-24">
          <aside className="md:col-span-3">
            <div className="md:sticky md:top-32">
              <p className="eyebrow text-muted">Share</p>
              <ShareLinks url={url} title={post.title} />
            </div>
          </aside>
          <div className="prose-va md:col-span-8 md:col-start-5" dangerouslySetInnerHTML={{ __html: sanitizeArticle(post.content_html) }} />
        </div>
      </article>
      {related.length > 0 && (
        <section className="border-t border-line bg-white py-24">
          <div className="container-x">
            <Eyebrow>Related insights</Eyebrow>
            <ul className="mt-12 grid gap-10 md:grid-cols-3">{related.map((r) => <li key={r.id}><PostCard post={r} /></li>)}</ul>
          </div>
        </section>
      )}
      <ContactCta />
      <JsonLd data={[
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Insights", path: "/insights" }, { name: post.title, path: `/insights/${post.slug}` }]),
        { "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.excerpt ?? undefined, image: post.cover_image_url ?? undefined,
          datePublished: post.published_at, dateModified: post.updated_at, author: { "@type": "Organization", name: post.author_name ?? settings?.brand_name ?? "VIOR ATELIER" },
          publisher: { "@type": "Organization", name: settings?.brand_name ?? "VIOR ATELIER", logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/logo-primary-navy.png` } }, mainEntityOfPage: url },
      ]} />
    </>
  );
}
