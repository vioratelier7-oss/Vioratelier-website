#!/usr/bin/env bash
# Dump the VIOR ATELIER database (schema + data of the public schema and auth users) to backups/.
# Usage: SUPABASE_DB_URL="postgresql://..." ./scripts/backup-db.sh
set -euo pipefail
: "${SUPABASE_DB_URL:?Set SUPABASE_DB_URL to the project's Postgres connection string}"
mkdir -p backups
out="backups/vior-$(date +%Y%m%d-%H%M).sql"
pg_dump "$SUPABASE_DB_URL" --no-owner --no-privileges --schema=public --file="$out"
pg_dump "$SUPABASE_DB_URL" --no-owner --no-privileges --data-only --table=auth.users --table=auth.identities >> "$out"
echo "Wrote $out"
