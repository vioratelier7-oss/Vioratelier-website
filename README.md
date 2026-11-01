# VIOR ATELIER: website + CMS

*Crafting Digital Experiences.*

The production codebase for **vioratelier.com**:
- an editorial public website;
- a secure, database-driven admin CMS at `/admin`.

It is built with Next.js (App Router), TypeScript, Tailwind CSS and Framer Motion, on Supabase (Postgres, Auth and Storage), and is designed for Vercel.

| | |
|---|---|
| Public site | Home, Work + case studies, 3 service pages, About, Insights (blog), Contact (inquiry form), Privacy, Terms |
| CMS (`/admin`) | Dashboard, Projects (+ categories, galleries), Media library, Services, Inquiries (statuses, notes, CSV), Testimonials, Blog (rich text, drafts, scheduling), SEO manager, Site settings, Users & roles |
| Security | Supabase Auth, Super Admin / Editor roles enforced by Row Level Security, no public sign-up, server-only secrets, rate-limited + spam-protected inquiry form, activity log |
| SEO | Per-page metadata, canonical, Open Graph, `sitemap.xml`, `robots.txt`, JSON-LD (Organization, WebSite, Service, Article, BreadcrumbList, FAQPage) |

## Quick start (local)

```bash
npm install
npx supabase start          # local Postgres + Auth + Storage in Docker
npx supabase db reset       # applies supabase/migrations/*
cp .env.example .env.local  # then paste the local keys printed by `supabase start`
node scripts/seed-placeholders.mjs                                  # optional: labelled sample content
node scripts/create-admin.mjs --email you@example.com --name "Your Name"  # first Super Admin
npm run dev                 # http://localhost:3000  ·  CMS: http://localhost:3000/admin
```

## Documentation

| Doc | What it covers |
|---|---|
| [docs/STRUCTURE.md](docs/STRUCTURE.md) | Project folder structure and architecture |
| [docs/ADMIN_CMS.md](docs/ADMIN_CMS.md) | CMS structure, action rules, permission matrix |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema, migrations, RLS policy matrix |
| [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) | Environment variable checklist |
| [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) | Creating and configuring the production Supabase project |
| [docs/ADMIN_PROVISIONING.md](docs/ADMIN_PROVISIONING.md) | Creating the first Super Admin, inviting editors |
| [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md) | Running everything on your machine |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel + vioratelier.com + go-live checklist |
| [docs/BACKUPS.md](docs/BACKUPS.md) | Backup and restore strategy |
| [docs/BRAND.md](docs/BRAND.md) | Logo files and how they are used |
| [docs/TESTING_REPORT.md](docs/TESTING_REPORT.md) | What was tested, how, and results |
| [docs/LIMITATIONS.md](docs/LIMITATIONS.md) | Known limitations and what is still pending |

## Content honesty

- The repo contains **no invented clients, testimonials, statistics, team members or social links**.
- The optional `seed-placeholders` script adds sample projects flagged `is_sample`. These show a visible "Sample · Placeholder" badge, and their text says they are layout examples. Unpublish or delete them in the CMS before launch.
- It also adds three starter Insights articles written by the studio; review them before launch.
