# Admin provisioning

There is **no public sign-up page**:
- sign-ups are disabled in Supabase Auth;
- RLS ensures that only a Super Admin can grant roles.

## First Super Admin (one time)
Run this from your machine with the production env vars available (in `.env.local`, or exported in the shell):
```bash
node scripts/create-admin.mjs --email vioratelier7@gmail.com --name "Atif" --role super_admin
```
- The script uses the service-role key **locally**, so it never runs in the browser or on Vercel.
- It creates the auth user with a confirmed email and assigns the `super_admin` role.
- It is idempotent: re-running it for an existing user just ensures the role.
- If `ADMIN_PASSWORD` is not set in the environment, it generates a strong password and prints it **once**. Sign in at `/admin/login` and change it straight away via "Forgot password".

## More team members
Sign in as Super Admin, open **Users**, then choose **Invite**:
1. Enter the email and pick **Editor** or **Super Admin**.
2. Supabase emails an invitation link. The person sets a password and lands in the CMS.
3. Roles can be changed or revoked from the same screen. The database refuses to remove the last Super Admin.

## Roles

| | Super Admin | Editor |
|---|---|---|
| Projects, categories, galleries, media | ✓ | ✓ |
| Blog, testimonials, services (edit) | ✓ | ✓ |
| Inquiries: view, status, notes, export | ✓ | ✓ |
| Delete inquiries / services | ✓ | – |
| Page SEO (edit) | ✓ | ✓ |
| Site settings | ✓ | – |
| Users & roles | ✓ | – |

These rules are enforced in three places: hidden in the UI, checked in every server action, and enforced by Postgres RLS. The third is what makes them hold even against handcrafted requests (see TESTING_REPORT.md).
