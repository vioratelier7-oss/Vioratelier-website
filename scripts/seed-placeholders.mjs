#!/usr/bin/env node
/**
 * Seeds CLEARLY-LABELLED placeholder content for local development / design preview:
 *  - uploads the photos in supabase/seed-assets/ to the "media" Storage bucket (+ media_assets rows)
 *  - attaches images to the three real services
 *  - inserts sample projects flagged is_sample = true (shown publicly with a "Sample · Placeholder" badge)
 *  - inserts three starter Insights articles written by the studio (review before launch)
 * Never run against production unless you want these placeholders. Idempotent (upserts by slug/path).
 * Usage: node scripts/seed-placeholders.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
for (const f of [".env.local", ".env"]) { const p = path.join(root, f); if (existsSync(p)) try { process.loadEnvFile(p); } catch {} }
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
const db = createClient(url, key, { auth: { persistSession: false } });

const DATA = {
 "images": [
  "blog-desk",
  "blog-menu",
  "blog-wireframes",
  "gallery-arch-2",
  "gallery-cafe-2",
  "gallery-interior-2",
  "gallery-stay-2",
  "sample-architecture",
  "sample-cafe",
  "sample-interior",
  "sample-stay",
  "service-qr",
  "service-seo",
  "service-web"
 ],
 "alts": {
  "sample-cafe": "Coffee being poured at a café counter",
  "sample-stay": "A calm hotel room with warm natural light",
  "sample-architecture": "A modern house at dusk with glowing windows",
  "sample-interior": "A neutral living room with soft textures",
  "gallery-cafe-2": "Coffee cups on a café table",
  "gallery-stay-2": "A hotel bedroom with crisp linen",
  "gallery-arch-2": "A contemporary living space with large glazing",
  "gallery-interior-2": "A minimal interior with natural materials",
  "service-web": "A bright desk with a laptop and notebook",
  "service-qr": "A table set at a restaurant",
  "service-seo": "Analytics charts on a laptop screen",
  "blog-menu": "The interior of a café with warm light",
  "blog-desk": "A tidy white desk with a laptop seen from above",
  "blog-wireframes": "Website wireframes sketched on paper beside a laptop"
 },
 "services": [
  {
   "slug": "website-design-development",
   "img": "service-web"
  },
  {
   "slug": "qr-code-menu-solutions",
   "img": "service-qr"
  },
  {
   "slug": "seo-setup-optimisation",
   "img": "service-seo"
  }
 ],
 "projects": [
  {
   "slug": "cafe-digital-menu-sample",
   "title": "Café Digital Menu",
   "cat": "qr-menus",
   "cover": "sample-cafe",
   "gallery": [
    "gallery-cafe-2"
   ],
   "feat": true,
   "tech": [
    "QR code menu",
    "Mobile-first design",
    "Menu CMS"
   ],
   "short": "A sample concept showing how a café’s QR menu could feel: warm, legible and quick to update."
  },
  {
   "slug": "boutique-stay-website-sample",
   "title": "Boutique Stay Website",
   "cat": "websites",
   "cover": "sample-stay",
   "gallery": [
    "gallery-stay-2"
   ],
   "feat": true,
   "tech": [
    "Next.js",
    "Responsive design",
    "SEO setup"
   ],
   "short": "A sample hospitality website concept with calm editorial pages and a clear enquiry journey."
  },
  {
   "slug": "architecture-studio-portfolio-sample",
   "title": "Architecture Studio Portfolio",
   "cat": "websites",
   "cover": "sample-architecture",
   "gallery": [
    "gallery-arch-2"
   ],
   "feat": true,
   "tech": [
    "Portfolio CMS",
    "Image optimisation"
   ],
   "short": "A sample portfolio concept where large imagery and quiet typography let the work lead."
  },
  {
   "slug": "interior-brand-and-website-sample",
   "title": "Interior Brand & Website",
   "cat": "branding",
   "cover": "sample-interior",
   "gallery": [
    "gallery-interior-2"
   ],
   "feat": false,
   "tech": [
    "Brand identity",
    "Website design"
   ],
   "short": "A sample brand and website concept for an interior studio, built around texture and light."
  }
 ],
 "posts": [
  {
   "slug": "what-makes-a-qr-menu-easy-to-use",
   "title": "What Makes a QR Code Menu Easy to Use",
   "cat": "hospitality",
   "img": "blog-menu",
   "feat": true,
   "excerpt": "A good digital menu disappears into the dining experience. These are the details that make guests reach for it without a second thought.",
   "html": "<p>A QR code menu is often the first piece of your brand a guest holds in their hand. When it works well, nobody notices it. When it does not, it becomes the thing they remember: a slow PDF, tiny text, endless pinching and zooming.</p>\n<h2>Design for one hand and a small screen</h2>\n<p>Most guests open your menu with one hand while talking to the people at their table. Large, legible type, generous spacing between items and clear category navigation matter far more than decoration.</p>\n<ul><li>Use real text, never a scanned image or PDF.</li><li>Keep prices aligned and easy to compare.</li><li>Let guests jump straight to a category like Coffee or Desserts.</li></ul>\n<h2>Make updates effortless</h2>\n<p>The real advantage of a digital menu is that it can change as quickly as your kitchen does. If marking a dish as unavailable takes more than a minute, it will not happen during a busy service. A simple editing interface is as important as the design guests see.</p>\n<h2>Keep it on-brand</h2>\n<p>Your menu should feel like your venue: the same typefaces, colours and tone of voice. A generic template undoes the care you have put into the space itself.</p>\n<blockquote>The best digital menus feel like a natural extension of the table, not a piece of technology.</blockquote>\n<p>Finally, test the QR code where it will actually live: on the table, under the venue's lighting, from a normal seated distance.</p>"
  },
  {
   "slug": "seo-foundations-for-a-new-business-website",
   "title": "SEO Foundations Every New Business Website Needs",
   "cat": "seo",
   "img": "blog-desk",
   "feat": false,
   "excerpt": "Before thinking about rankings, make sure search engines can find, crawl and understand your site. A practical checklist for launch.",
   "html": "<p>Search engine optimisation is often sold as a mystery. The foundations are not. Before any content strategy, a new website needs to be technically easy for search engines to discover and understand.</p>\n<h2>The launch checklist</h2>\n<ol><li><strong>Unique titles and descriptions</strong> for every important page, written for people first.</li><li><strong>An XML sitemap</strong> that lists the pages you want indexed, submitted in Google Search Console.</li><li><strong>A robots.txt file</strong> that does not accidentally block the whole site.</li><li><strong>Clean, descriptive URLs</strong> such as /services/website-design rather than /page?id=12.</li><li><strong>Fast, optimised images</strong> with meaningful alt text.</li><li><strong>Structured data</strong> that accurately describes your organisation and content.</li></ol>\n<h2>Measure from day one</h2>\n<p>Connect Google Search Console and Analytics at launch, not months later. Early data shows which pages are being found and where visitors drop off, so decisions are based on evidence rather than guesswork.</p>\n<h2>A note on guarantees</h2>\n<p>No one can honestly guarantee a specific ranking on Google. What can be guaranteed is a site that follows best practice, so that good content has every chance to be found.</p>"
  },
  {
   "slug": "designing-a-website-that-earns-trust",
   "title": "Designing a Website That Earns Trust",
   "cat": "design",
   "img": "blog-wireframes",
   "feat": false,
   "excerpt": "Visitors decide in seconds whether a business feels credible. Clarity, restraint and honesty do more for trust than any visual trick.",
   "html": "<p>People judge a business by its website long before they speak to anyone. That first impression is formed quickly, and it is shaped less by flashy effects than by clarity and care.</p>\n<h2>Say what you do, immediately</h2>\n<p>The opening screen should answer three questions: what you offer, who it is for, and what to do next. If a visitor has to scroll to understand your business, many will not.</p>\n<h2>Restraint reads as confidence</h2>\n<p>Generous whitespace, a limited palette and consistent typography signal a business that knows what it is. Clutter signals the opposite.</p>\n<h2>Be honest</h2>\n<p>Real project images, genuine testimonials and accurate claims build lasting credibility. Invented statistics and stock praise are easy to spot, and they undermine everything else on the page.</p>\n<h2>Make contact effortless</h2>\n<p>A clear enquiry form, a visible phone number and a quick way to message you remove the final barrier between interest and conversation.</p>"
  }
 ]
};

async function upload(name) {
  const file = readFileSync(path.join(root, "supabase/seed-assets", `${name}.jpg`));
  const objectPath = `seed/${name}.jpg`;
  const { error } = await db.storage.from("media").upload(objectPath, file, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(`upload ${name}: ${error.message}`);
  const publicUrl = db.storage.from("media").getPublicUrl(objectPath).data.publicUrl;
  await db.from("media_assets").upsert({ bucket: "media", path: objectPath, public_url: publicUrl, file_name: `${name}.jpg`, mime_type: "image/jpeg",
    size_bytes: file.length, alt_text: DATA.alts[name] ?? null }, { onConflict: "bucket,path" });
  return publicUrl;
}
const must = ({ data, error }, what) => { if (error) throw new Error(`${what}: ${error.message}`); return data; };

const urls = {};
for (const name of DATA.images) urls[name] = await upload(name);
console.log(`uploaded ${Object.keys(urls).length} images`);

for (const s of DATA.services) {
  must(await db.from("services").update({ image_url: urls[s.img], image_alt: DATA.alts[s.img] }).eq("slug", s.slug), `service ${s.slug}`);
}
const cats = Object.fromEntries(must(await db.from("project_categories").select("id,slug"), "cats").map((c) => [c.slug, c.id]));
const bcats = Object.fromEntries(must(await db.from("blog_categories").select("id,slug"), "bcats").map((c) => [c.slug, c.id]));

let order = 0;
for (const p of DATA.projects) {
  const row = must(await db.from("projects").upsert({
    slug: p.slug, title: p.title, client_name: "Sample concept", category_id: cats[p.cat], short_description: p.short,
    overview: "This is a placeholder case study created to demonstrate the layout of VIOR ATELIER’s portfolio. It does not describe a real client or a completed project. Replace it with a genuine project in the CMS, or unpublish it before launch.",
    challenge: "Placeholder: describe the client’s situation and the problem the project needed to solve.",
    solution: "Placeholder: describe the approach, the design decisions and what was built.",
    results: null, results_verified: false, cover_image_url: urls[p.cover], cover_image_alt: DATA.alts[p.cover],
    technologies: p.tech, status: "published", published_at: new Date().toISOString(), is_featured: p.feat, is_sample: true, sort_order: order++,
    seo_title: `${p.title} (sample) · VIOR ATELIER`, seo_description: p.short,
  }, { onConflict: "slug" }).select("id").single(), `project ${p.slug}`);
  await db.from("project_images").delete().eq("project_id", row.id);
  const imgs = [p.cover, ...p.gallery].map((g, i) => ({ project_id: row.id, image_url: urls[g], storage_path: `seed/${g}.jpg`, alt_text: DATA.alts[g], sort_order: i }));
  must(await db.from("project_images").insert(imgs), "gallery");
}
console.log(`seeded ${DATA.projects.length} sample projects`);

let day = 0;
for (const b of DATA.posts) {
  const words = b.html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  must(await db.from("blog_posts").upsert({
    slug: b.slug, title: b.title, excerpt: b.excerpt, content_html: b.html, cover_image_url: urls[b.img], cover_image_alt: DATA.alts[b.img],
    category_id: bcats[b.cat], author_name: "VIOR ATELIER Studio", status: "published", is_featured: b.feat,
    published_at: new Date(Date.now() - (day++ * 6 + 1) * 86400000).toISOString(), reading_minutes: Math.max(1, Math.round(words / 220)),
    seo_title: `${b.title} · VIOR ATELIER`, seo_description: b.excerpt,
  }, { onConflict: "slug" }), `post ${b.slug}`);
}
console.log(`seeded ${DATA.posts.length} articles`);
