# VIOR ATELIER · Admin CMS (`/admin`)

## Layout
- `app/admin/(auth)/*`: login, forgot-password, reset-password (no sidebar). No signup page exists.
- `app/admin/auth/callback/route.ts`: handles `?code=` (PKCE) and `?token_hash=&type=` (verifyOtp). Invite links that carry the session in the URL fragment are passed to `/admin/reset-password`, whose client bridge stores the session.
- `app/admin/(cms)/*`: the sidebar shell (`layout.tsx`). It shows a "no access" screen to a signed-in user with no `user_roles` row.
- `app/admin/(cms)/inquiries/export/route.ts`: the CSV export. It checks staff server-side, honours `q` and `status`, and defuses formula injection.
- `components/admin/*`: UI. `forms.tsx` has ActionForm, toasts, buttons and fields. `MediaPicker.tsx` has ImageField and the library modal. `fields.tsx` has TitleSlug, TagInput, LineList, GalleryEditor, SeoFields and SnippetPreview.
- `lib/admin/actions/*`: server actions, one file per module.
- `lib/admin/upload.ts`: browser upload. It validates type/size, downscales to 2400 px, converts to WebP (SVG and GIF are kept as-is), writes to `media/uploads/YYYY/MM/<uuid>-<slug>.<ext>` with the user's session, then records the row.

## Rules every action follows
1. `requireStaff()` or `requireSuperAdmin()` first.
2. Zod validation.
3. Writes go through `staff.supabase`, the user's session, so RLS applies. The service-role client is used in one place only: `inviteUserByEmail`, in `users.ts`, after `requireSuperAdmin()`.
4. Results are friendly `ActionState` messages, shown as toasts or inline.
5. Content changes call `revalidatePath('/', 'layout')`.

## Permissions (UI, action and RLS all agree)
| | Super Admin | Editor |
|---|---|---|
| Projects, categories, media, blog, testimonials, page SEO | ✔ | ✔ |
| Services: create, edit, reorder | ✔ | ✔ |
| Services: delete | ✔ | ✖ |
| Inquiries: view, status, notes, CSV | ✔ | ✔ |
| Inquiries: delete | ✔ | ✖ |
| Inquiry notes: delete | any | own |
| Settings, Users | ✔ | ✖ (hidden, page redirects, action refuses, RLS refuses) |

## First admin
```
node scripts/create-admin.mjs --email owner@example.com --name "Name" --role super_admin
```
Set `ADMIN_PASSWORD` to choose the password. Otherwise a strong one is generated and printed once. The script is idempotent.

## Auth redirect URLs
Password-reset and invite emails return to `${NEXT_PUBLIC_SITE_URL}/admin/auth/callback?next=/admin/reset-password`. That URL must be on the Supabase Auth redirect allow-list (glob: `https://vioratelier.com/admin/auth/callback**`). If it isn't, Supabase falls back to the Site URL and the link lands on the homepage.
