# Known limitations & pending items

## Needs the studio's accounts (not done here)
- **Production Supabase project:** create it, run `supabase db push`, and set the auth settings (SUPABASE_SETUP.md).
- **Vercel deployment, GitHub repo, and DNS for vioratelier.com** (DEPLOYMENT.md). The code has **not** been deployed to Vercel or the real domain.
- **Email:** add a Resend API key, verify the sending domain, and set up custom SMTP for Supabase Auth emails (invites, password resets). Without these, inquiries are still saved and shown in the CMS, but no emails are sent.
- **Real content:**
  - replace the 4 labelled sample projects with real ones and review the 3 starter articles;
  - add real testimonials (the site shows an honest "first clients" state until then) and real social links (none are invented).

## Content decisions to confirm
- **Phone number:** the site uses **+91 94124 06016** and WhatsApp **919412406016**, as written in the website brief. The business card design shows **…015**. Confirm which is correct; it can be changed in **Admin → Settings** without touching code.
- **Privacy Policy and Terms:** these are plain-language starting drafts written for a studio of this kind. They are not legal advice and should be reviewed by a lawyer before launch.
- **Images:** placeholder photography is from Unsplash under the Unsplash licence (free commercial use; credits in `supabase/seed-assets/CREDITS.md`). Replace it with the studio's own work over time.

## Technical notes
- **Testing:** Lighthouse and the responsive checks ran in headless Chromium, not on physical phones.
- **Layout shift:**
  - The image reveal animation causes a small lab-measured layout shift (CLS ≈ 0.13) on the article page.
  - It is fixed on service pages. If real-user data flags it, swap `RevealImage` for a fade.
- **Untested CMS features:**
  - drag-to-reorder (only the arrow buttons were tested);
  - inserting a library image into the article editor;
  - the copy-URL button;
  - the "image in use" delete guard;
  - choosing an OG image.

  They are implemented but were not exercised in automated tests.
- **CMS gaps:**
  - The article editor's link button uses the browser's simple prompt dialog.
  - The activity log shows the latest 10 entries on the dashboard; there is no separate full-history page yet.
  - The Users screen does not show pending invitations or last sign-in time.
- **Lint command:** `next lint` is deprecated in Next.js 16. When upgrading, run `npx @next/codemod next-lint-to-eslint-cli .`.
- **Design preview vs code:** the published design preview predates a final accessibility tweak (slightly deeper champagne on small labels). The code in this repo has the updated colours.
