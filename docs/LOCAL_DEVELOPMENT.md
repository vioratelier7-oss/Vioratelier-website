# Local development

**Requirements:**
- Node.js 20 or newer;
- Docker, for the local Supabase stack;
- npm.

```bash
npm install
npx supabase start -x studio,edge-runtime,logflare,vector,realtime,supavisor
```
`supabase start` prints the local API URL and keys. Put them in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable/anon key>
SUPABASE_SERVICE_ROLE_KEY=<secret/service_role key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RATE_LIMIT_SALT=any-local-string
```
Then:
```bash
npx supabase db reset                       # fresh DB from migrations
node scripts/seed-placeholders.mjs          # optional sample content (+ images uploaded to Storage)
node scripts/create-admin.mjs --email admin@example.test --name "Local Admin"
npm run dev
```
- Site: http://localhost:3000
- CMS: http://localhost:3000/admin
- Auth emails (invites, password resets): Mailpit at http://127.0.0.1:54324

## Useful commands

| Command | Purpose |
|---|---|
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint (Next rules) |
| `npm run build` | Production build |
| `npm run db:test` | RLS test suite against the configured Supabase (`scripts/test-rls.mjs`) |
| `npx supabase migration new <name>` | Create a new migration |
| `npx supabase gen types typescript --local > lib/database.types.ts` | Regenerate DB types after a schema change |
