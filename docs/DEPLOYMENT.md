# Deployment (Vercel + vioratelier.com)

## What the studio needs to provide
1. **A Supabase account**, with a project created as in SUPABASE_SETUP.md. The person deploying needs project access: invite them as a team member. **Do not send keys over chat.**
2. **A Vercel account**. The Hobby plan works to start; Pro is recommended for a commercial site.
3. **A GitHub account** with a repository for this code. Vercel deploys from Git.
4. **Access to the DNS for vioratelier.com**, at the registrar where the domain was bought (GoDaddy, Hostinger, Namecheap…).

## Steps
1. Push this repo to a private GitHub repository.
2. In Vercel, click **Add New → Project**, import the repo, and keep the framework preset as Next.js.
3. Add every variable from ENVIRONMENT.md under **Production**, using the production Supabase project.
4. Deploy. Vercel builds with `next build`, so lint and type errors fail the build by design.
5. Apply the migrations to production: `npx supabase db push` (SUPABASE_SETUP.md §2).
6. Create the first Super Admin (ADMIN_PROVISIONING.md).
7. **Domain.** In Vercel go to **Project → Settings → Domains**, add `vioratelier.com` and `www.vioratelier.com`, and set one to redirect to the other. At the DNS provider:
   - `A` record for `@` → `76.76.21.21` (Vercel);
   - `CNAME` record for `www` → `cname.vercel-dns.com`.

   Vercel shows the exact values for your project. Use those if they differ.
8. **SSL.** Vercel issues and renews HTTPS certificates automatically once DNS resolves. That's usually minutes, but can take up to 48 hours.
9. Set Supabase **Auth → URL Configuration** Site URL to `https://vioratelier.com` and add `https://vioratelier.com/admin/auth/callback` as a redirect URL.
10. **Search.**
    - In Google Search Console, verify the domain (a DNS TXT record) and submit `https://vioratelier.com/sitemap.xml`.
    - Optionally add Google Analytics.

## Go-live checklist
- [ ] Pages return 200 on desktop and mobile: `/`, `/work`, `/services/*`, `/about`, `/insights`, `/contact`, `/privacy`, `/terms`.
- [ ] A test inquiry from `/contact` appears in **/admin → Inquiries**. If Resend is configured, the notification email arrives too.
- [ ] Log in as Super Admin. Create a project with images, publish it, and check it appears on `/work`. Then unpublish it.
- [ ] Sample/placeholder projects are deleted or unpublished. Starter articles are reviewed.
- [ ] Settings are checked: phone, WhatsApp number, email, social links (add real ones only).
- [ ] `https://vioratelier.com/robots.txt` and `/sitemap.xml` load, and `/admin` is disallowed.
- [ ] `npm run db:test` passes against **staging** only. It creates and deletes temporary users, so don't run it on production.
- [ ] Back up the production database once after launch (BACKUPS.md).

## Content persists across deployments
All content lives in Supabase Postgres and Storage, not in the Vercel deployment. Redeploying never deletes projects, posts, inquiries or images.
