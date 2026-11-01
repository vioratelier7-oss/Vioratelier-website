# Backup strategy

| What | Where it lives | Backup |
|---|---|---|
| Database (content, inquiries, users, settings) | Supabase Postgres | **Automatic:** daily backups on the Supabase Pro plan, with 7-day retention; Point-in-Time Recovery is an add-on. **Manual:** `scripts/backup-db.sh` (below) before big changes, and weekly on the Free plan. |
| Images | Supabase Storage bucket `media` | Download through the dashboard, or with `supabase storage cp -r ss:///media ./media-backup --experimental`. Original files should also be kept by the studio. |
| Code + migrations | GitHub | Git history; Vercel keeps previous deployments for instant rollback. |

## Manual database backup
```bash
SUPABASE_DB_URL="postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres" ./scripts/backup-db.sh
```
This writes `backups/vior-YYYYMMDD-HHMM.sql`: schema plus data, excluding the Supabase-managed schemas. Store it somewhere private. The file contains inquiry personal data.

## Restore
- **Supabase dashboard:** go to Database → Backups → Restore. Pro plan only.
- **From a manual dump:** `psql "$SUPABASE_DB_URL" -f backups/vior-YYYYMMDD-HHMM.sql`, run against an empty project after `supabase db push`.

## Migration discipline
- Schema changes are made only through new files in `supabase/migrations/`, committed to Git and applied with `supabase db push`.
- Never edit an applied migration.
