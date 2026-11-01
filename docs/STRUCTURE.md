# Folder structure & architecture

```
app/
  layout.tsx                 Root layout: self-hosted fonts (Cormorant Garamond, Manrope), global metadata, Organization/WebSite JSON-LD
  globals.css                Tailwind v4 theme tokens (ivory, navy, champagne, stone, ink) + editorial utilities
  sitemap.ts · robots.ts     Dynamic sitemap (static pages + published projects, services, posts); robots disallows /admin
  icon.svg · favicon.ico · apple-icon.png
  fonts/                     WOFF2 font files (no runtime Google Fonts dependency)
  (site)/                    Public website (route group: shared header, footer, loader, WhatsApp button)
    page.tsx                 Home (10 sections)
    services/ · services/[slug]/
    work/ · work/[slug]/     Portfolio with filters + search · case-study pages
    about/ · insights/ · insights/[slug]/
    contact/ (page + actions.ts: validated, rate-limited, spam-protected server action)
    privacy/ · terms/ · not-found.tsx · template.tsx (page transition)
  admin/                     CMS (see ADMIN_CMS.md)
    (auth)/                  login · forgot-password · reset-password
    (cms)/                   dashboard, projects, media, services, inquiries (+ CSV export route), testimonials, blog, seo, settings, users
    auth/callback/route.ts   Email-link / PKCE callback
components/
  brand/                     Logo geometry (paths.ts) + Logo components: never rendered as text
  site/                      Public UI: Header, Footer, Loader, motion primitives, cards, InquiryForm, Faq, ProjectExplorer…
  admin/                     CMS UI: Sidebar, forms, MediaPicker/Library, RichTextEditor (TipTap), GalleryEditor…
lib/
  env.ts                     Typed env access; server-only secrets never imported by client code
  supabase/                  server.ts (cookie session, RLS applies) · client.ts (browser) · admin.ts (service role, `server-only`)
  auth.ts                    getStaff / requireStaff / requireSuperAdmin helpers
  data/public.ts             Read queries for the public site (published content only)
  seo.ts                     Metadata builder + JSON-LD helpers
  validation/inquiry.ts      Zod schema shared by the form (client) and the server action
  sanitize.ts · email.ts · utils.ts · database.types.ts (generated)
  admin/                     Server actions per module, Zod schemas, upload pipeline, revalidation
middleware.ts                Refreshes the Supabase session; redirects signed-out users away from /admin
supabase/
  config.toml                Local stack config (sign-ups disabled)
  migrations/                Schema, RLS, triggers, storage, baseline content
  seed-assets/               Placeholder images + CREDITS.md (Unsplash licence)
scripts/
  create-admin.mjs           Provision a Super Admin / Editor (service role, run locally)
  seed-placeholders.mjs      Optional labelled sample projects + starter articles
  test-rls.mjs               RLS test suite (44 checks)
  backup-db.sh               Manual pg_dump backup
public/
  brand/                     Logo SVG/PNG set · images/ (hero, about, contact) · og-default.jpg
docs/                        This documentation
```

## How data flows
- **Public pages** are Server Components that query Supabase with the anon key.
  - RLS guarantees they only ever see published, approved, non-future content.
  - Pages are statically generated and revalidated (ISR, 60 s).
  - Every CMS save also calls `revalidatePath`, so changes appear immediately.
- **The contact form** posts to a Server Action that does the following in order:
  1. checks a honeypot and a minimum fill time;
  2. validates with Zod;
  3. rate-limits by hashed IP and by email (in Postgres);
  4. inserts using the server-only service role, because visitors have no direct insert rights;
  5. optionally emails a notification through Resend.
- **The CMS** uses the signed-in user's own session for every read and write, so the database's RLS is the final authority.
  - The service-role key is used only for sending invitations, and only after a Super Admin check.
- **Images** upload from the browser straight to Supabase Storage, using the user's session; Storage policies allow staff only.
  - Large images are downscaled to 2400 px and converted to WebP first.
  - Next/Image serves optimised sizes.
