# Database: schema, migrations and RLS

Postgres on Supabase. All schema lives in version-controlled migrations in `supabase/migrations/`, applied in filename order:

| Migration | Contents |
|---|---|
| `20261030000001_core_schema.sql` | Enums, `slug` domain, all tables, constraints, indexes, `updated_at` triggers |
| `20261030000002_security.sql` | Role helpers, new-user→profile trigger, last-Super-Admin guard, activity-log triggers, rate-limit function, **RLS on every table + policies**, `media` storage bucket + policies |
| `20261030000003_baseline_content.sql` | Real baseline content from the brief: site settings, the 3 services, categories, SEO page rows |
| later files | Any additions made while building the CMS (see the file headers) |

Conventions:
- UUID primary keys (`gen_random_uuid()`) and `created_at` / `updated_at` on every table;
- foreign keys with explicit `on delete` behaviour;
- `check` constraints for lengths, formats (slugs, emails, URLs) and enums;
- `snake_case` names.

## Tables

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | One row per auth user (auto-created by trigger) | `id → auth.users`, `email`, `full_name` |
| `user_roles` | CMS role per user | `user_id` (unique), `role app_role` (`super_admin`, `editor`) |
| `project_categories` | Portfolio categories | `name`, `slug` (unique), `sort_order` |
| `projects` | Portfolio / case studies | `title`, `slug` (unique), `client_name`, `category_id`, `short_description`, `overview`, `challenge`, `solution`, `results`, `results_verified`, `cover_image_url/alt`, `project_url`, `technologies[]`, `completed_on`, `status` (draft/published), `is_featured`, `is_sample`, `sort_order`, `published_at`, `seo_title/description`, `og_image_url` |
| `project_images` | Gallery images per project | `project_id`, `image_url`, `storage_path`, `alt_text`, `caption`, `sort_order` |
| `service_categories` | Service grouping | `name`, `slug` |
| `services` | Service pages | `title`, `slug`, `summary`, `hero_heading`, `overview`, `scope[]`, `problems[]`, `benefits[]`, `deliverables[]`, `faqs jsonb`, `image_url/alt`, `sort_order`, `status`, SEO fields |
| `inquiries` | Contact-form leads | contact fields, `service`, `budget`, `timeline`, `description`, `status inquiry_status` (new, contacted, proposal_sent, in_discussion, converted, closed), `ip_hash`, `user_agent` |
| `inquiry_notes` | Internal notes on a lead | `inquiry_id`, `author_id`, `body` |
| `testimonials` | Client testimonials | `client_name`, `business_name`, `designation`, `body`, `rating` 1–5, `avatar_url`, `is_approved`, `status` |
| `blog_categories` | Insights categories | `name`, `slug` |
| `blog_posts` | Insights articles | `title`, `slug`, `excerpt`, `content_html` (sanitised), `cover_image_url/alt`, `category_id`, `author_id/name`, `status`, `is_featured`, `published_at` (future = scheduled), `reading_minutes`, SEO fields |
| `media_assets` | Media library index for Storage objects | `bucket`, `path` (unique per bucket), `public_url`, `mime_type` (images only), `size_bytes` ≤ 10 MB, `width/height`, `alt_text` |
| `site_settings` | Single row of global settings | brand, tagline, logo, intro, footer, phone, WhatsApp number + message, email, website, `social_links jsonb`, `budget_options[]`, `timeline_options[]`, default SEO |
| `seo_pages` | SEO manager for static pages | `path` (unique), meta title/description, canonical, OG title/description/image, `robots_index`, `robots_follow` |
| `activity_logs` | Audit trail (written only by triggers) | `actor_id`, `action`, `entity_type`, `entity_id`, `summary` |
| `rate_limits` | Fixed-window counters for the public form | `bucket_key` (unique), `window_start`, `hits` |

## Row Level Security matrix
RLS is **enabled on every table**. In addition, `anon` has no INSERT/UPDATE/DELETE privilege on any public table at all.

| Table | Visitor (anon) | Editor | Super Admin |
|---|---|---|---|
| projects / project_images | read **published** | read all, create, edit, delete | same |
| services | read **published** | read all, create, edit | + delete |
| testimonials | read **approved + published** | full | full |
| blog_posts | read **published with `published_at ≤ now()`** | full | full |
| categories (3 tables) | read | full | full |
| inquiries | **none** (submission only via validated server route) | read, update status | + delete |
| inquiry_notes | none | read; add as self; edit/delete own | full |
| media_assets | none | full | full |
| site_settings | read | read | **update** |
| seo_pages | read | update | + insert/delete |
| user_roles | none | read own | **full** (DB refuses removing the last Super Admin) |
| profiles | none | read staff; update own | full |
| activity_logs | none | read | read |
| rate_limits | none | none | none (only the `consume_rate_limit` SECURITY DEFINER function, executable by `service_role` only) |
| storage `media` bucket | public file URLs | upload/update/delete | same |

Role checks use `public.is_staff()` / `public.is_super_admin()`. These are `SECURITY DEFINER` functions with a pinned `search_path` that read `user_roles` for `auth.uid()`. Because a user's role can only be written by a Super Admin, changing a request in the browser cannot grant privileges.

Every policy above is exercised by `scripts/test-rls.mjs` (results in TESTING_REPORT.md).
