# Environment variable checklist

Set these in `.env.local` for local development and in **Vercel → Project → Settings → Environment Variables** for Production and Preview. Never commit real values.

| Variable | Scope | Required | Where to find it | Notes |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | yes | Supabase → Project Settings → API → Project URL | e.g. `https://abcd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | yes | Supabase → Project Settings → API → `anon` / publishable key | Safe in the browser: RLS restricts what it can do |
| `NEXT_PUBLIC_SITE_URL` | public | yes | | `https://vioratelier.com` in production (no trailing slash). Used for canonical URLs, sitemap, auth redirects |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | yes | Supabase → Project Settings → API → `service_role` / secret key | Bypasses RLS. Used only by the inquiry route, user invitations and scripts. **Never prefix with `NEXT_PUBLIC_`.** |
| `RATE_LIMIT_SALT` | server only | yes | generate: `openssl rand -hex 32` | Salts the IP/email hashes used for rate limiting (raw IPs are never stored) |
| `RESEND_API_KEY` | server only | optional | resend.com → API Keys | Enables inquiry email notifications. Without it, inquiries are still saved and shown in the CMS |
| `EMAIL_FROM` | server only | with Resend | | e.g. `VIOR ATELIER <hello@vioratelier.com>`; the domain must be verified in Resend |
| `ADMIN_NOTIFICATION_EMAIL` | server only | optional | | Where new-inquiry alerts go (defaults to the contact email in Site settings) |
| `SEND_INQUIRY_CONFIRMATION` | server only | optional | | `true` to email the visitor a confirmation |
| `NEXT_PUBLIC_IMAGE_UNOPTIMIZED` | build | no | | Only for the static design-preview export. Leave unset in production |
| `NEXT_PUBLIC_DESIGN_PREVIEW` | build | no | | Only for the static design preview (disables the form, shows a banner). Leave unset in production |

## Development vs production

- Use **separate Supabase projects** for development/staging and production, each with its own keys.
- In Vercel, set Production variables against the production project. Point Preview deployments at a staging project, or leave Preview unset.
- `supabase/config.toml` is for the local stack only. Production auth settings are configured in the Supabase dashboard (see SUPABASE_SETUP.md).
