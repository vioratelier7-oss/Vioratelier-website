import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/data/public";
import { formatDate } from "@/lib/utils";

export function PostCard({ post, large = false }: { post: BlogPost; large?: boolean }) {
  return (
    <Link href={`/insights/${post.slug}`} className="group block">
      <div className={`relative overflow-hidden bg-stone/40 ${large ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        {post.cover_image_url && <Image src={post.cover_image_url} alt={post.cover_image_alt ?? post.title} fill sizes={large ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 768px) 33vw, 100vw"} className="object-cover saturate-[.85] transition-transform duration-[1.6s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]" />}
      </div>
      <p className="eyebrow mt-6 flex flex-wrap gap-x-4 gap-y-1 text-muted">
        {post.category && <span className="text-champagne-deep">{post.category.name}</span>}
        <span>{formatDate(post.published_at)}</span>
        <span>{post.reading_minutes} min read</span>
      </p>
      <h3 className={`h-serif mt-3 text-navy ${large ? "text-[2.2rem] md:text-[2.8rem]" : "text-[1.7rem]"}`}><span className="link-underline">{post.title}</span></h3>
      {post.excerpt && <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-ink/70">{post.excerpt}</p>}
    </Link>
  );
}
