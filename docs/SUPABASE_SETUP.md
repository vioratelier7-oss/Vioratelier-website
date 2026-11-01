# Supabase setup (production)

## 1. Create the project
1. Sign in at https://supabase.com and click **New project**.
   - Name: `vior-atelier-prod`.
   - Region: **Mumbai (ap-south-1)**, closest to Indian visitors.
   - Set a strong database password and store it in a password manager.
2. Under **Project Settings → API**, copy the Project URL, the anon key and the service-role key into Vercel's environment variables (see ENVIRONMENT.md).

## 2. Apply the database migrations
From the repo, with the [Supabase CLI](https://supabase.com/docs/guides/cli):
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push        # applies supabase/migrations/*.sql in order
```
This creates every table, enum, function, trigger and RLS policy, plus:
- the public `media` storage bucket (images only, 10 MB limit);
- the baseline content: site settings, the three services, categories and SEO page rows.

Verify the result under **Table Editor**: each table should show "RLS enabled".

## 3. Auth settings (Dashboard → Authentication)
- **Sign In / Providers → Email**: enabled. **Allow new users to sign up: OFF** (no public registration).
- **URL Configuration**:
  - Site URL: `https://vioratelier.com`.
  - Redirect URLs: add `https://vioratelier.com/admin/auth/callback`, plus your Vercel preview domain if you use one.
- **Emails → SMTP** (recommended): connect a real SMTP provider such as Resend, Postmark or Zoho so password-reset and invite emails are delivered reliably. The built-in mailer is heavily rate-limited.
- **Email templates**: optionally restyle "Invite user" and "Reset password" with the VIOR ATELIER logo.

## 4. Storage
`db push` creates the `media` bucket and its policies:
- public read;
- upload, update and delete for CMS staff only;
- allowed types: jpeg/png/webp/avif/gif/svg.

Nothing else is needed.

## 5. First Super Admin
See [ADMIN_PROVISIONING.md](ADMIN_PROVISIONING.md).

## 6. Optional placeholder content
`node scripts/seed-placeholders.mjs` (with production env vars) adds the labelled sample projects and starter articles. Usually you will skip this in production and add real projects through the CMS.

## 7. Backups
See [BACKUPS.md](BACKUPS.md). On the Pro plan, daily backups are automatic. Enable Point-in-Time Recovery if the inquiry data is business-critical.
