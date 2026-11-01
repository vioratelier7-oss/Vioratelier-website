# Testing report

Test date: 30 October 2026. Every test ran against a **real local Supabase stack** (Postgres 17, Auth, Storage) and the real Next.js app; nothing was mocked.

## 1. Build quality
| Check | Result |
|---|---|
| `next build` (production, includes ESLint + TypeScript) | ✅ Passes. 60 routes |
| `tsc --noEmit` | ✅ No errors |
| `next lint` | ✅ No warnings or errors |

## 2. Security: Row Level Security (`npm run db:test`)
`scripts/test-rls.mjs` creates throwaway users (Editor, Super Admin, and a signed-in user with no role) plus fixtures. It then makes the same requests as each role through the public API, and checks every result. **Result: 44 of 44 checks pass.** Highlights:
- **Visitor:**
  - sees only published projects, approved testimonials, and posts that are published and not scheduled for the future;
  - cannot read inquiries, users, roles, the media table or the activity log;
  - cannot insert, update or delete anything, including inserting inquiries directly, bypassing the form;
  - cannot call the rate-limit function or upload files;
  - public sign-up is refused.
- **Signed-in user with no role:** cannot see drafts and cannot grant themselves Super Admin.
- **Editor:**
  - can create, publish and delete projects, change inquiry status, add notes, edit page SEO, and upload or delete images;
  - **cannot:** change site settings, grant or change roles (including promoting themselves), delete inquiries or services, add notes as another user, or forge activity-log entries.
- **Super Admin:** can change settings, grant and revoke roles, and delete inquiries.
- **Storage:** rejects non-image file types.
- **Activity log:** records actions under the real user who did them.

## 3. CMS end-to-end (browser automation, Playwright)
- **Auth:**
  - login, logout, forgot/reset password (email caught locally), and invite → set password → dashboard;
  - wrong or short passwords are rejected;
  - a user with no role sees the "no access" screen;
  - signed-out access to /admin and to the CSV export redirects to login.
- **Projects:**
  - create with an auto slug;
  - cover plus gallery upload: images are converted to WebP and downscaled from 3200 to 2400 px;
  - gallery alt text, captions and reorder persist after reload;
  - draft → publish makes the case study return 200 and appear on /work; unpublish makes it return 404;
  - a duplicate slug shows a clear error.
- **Inquiries:**
  - a real /contact submission appears marked as new;
  - status change and internal note persist after reload;
  - CSV export respects filters, and spreadsheet-formula injection is neutralised.
- **Blog:**
  - draft → 404, published → 200;
  - `<script>`, `onerror` and `javascript:` links are stripped by the sanitiser;
  - a future date shows as "Scheduled" and stays hidden from the public.
- **Testimonials:** stay hidden until approved.
- **Settings:** a change appears on the public site, and the original value was then restored.
- **Media:** an invalid type is rejected; upload, alt edit and delete work, and a deleted file is gone from storage.
- **Services:** reorder and FAQ edits work.
- **SEO:** page SEO saves.
- **Users:** invite, role change, access removal; removing the last Super Admin is refused.
- **Editor restrictions:**
  - Settings and Users are hidden and redirect away;
  - a replayed Super-Admin-only server action is refused;
  - delete buttons are hidden where not permitted.

## 4. Public site
- All routes return 200 on a production server; unknown URLs return 404; `/admin` redirects to login when signed out; `sitemap.xml` and `robots.txt` work.
- **Contact form:**
  - client-side validation shows errors;
  - a valid submission saves a row with status "new" and a hashed IP;
  - honeypot and minimum fill time are enforced;
  - rate limits are 5 per hour per IP and 3 per hour per email.
- **Responsive:** checked at 390 px (phone) and 1440 px (desktop); no horizontal overflow on any page.
- **Lighthouse** (mobile emulation with simulated slow 4G, production build on this machine):

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| home | 90 | 100 | 100 | 100 | 3.6 s | 0 |
| work | 90 | 99 | 100 | 100 | 3.6 s | 0 |
| service | 91 | 100 | 100 | 100 | 3.4 s | 0 |
| contact | 94 | 100 | 100 | 100 | 3.0 s | 0 |
| insight | 86 | 100 | 100 | 100 | 3.5 s | 0.129 |

Expect slightly better real-world numbers on Vercel's CDN. The remaining layout shift on the article page comes from the image reveal animation and is flagged in LIMITATIONS.md.

## 5. Design preview
- The static design preview at https://vior-atelier.sites.tab.bot was exported from this same app.
- On the live URL: all pages, CSS and images returned 200, and the browser showed no console errors.

## 6. Not verified (needs the real accounts)
- A deployment on Vercel and the vioratelier.com domain/SSL.
- Email delivery through a real SMTP/Resend account; only the local mail catcher was tested.
- Real-device testing on an iPhone or Android phone; checks ran in headless Chromium at phone size.
