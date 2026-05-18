#!/usr/bin/env bash
# =============================================================================
# database/migrate.sh — database migration runner
#
# Usage:
#   ./database/migrate.sh <DATABASE_URL>
#   ./database/migrate.sh postgres://maria@localhost:5432/kindora
#
# Or to run without an argument:
#   export DATABASE_URL=postgres://maria@localhost:5432/kindora
#   ./database/migrate.sh
#
# Rules:
#   Idempotency   — already-applied migrations are skipped by filename lookup
#   Transactions  — each migration runs inside BEGIN/COMMIT; any failure rolls
#                   back the entire migration (including the tracking INSERT)
#   Tracking      — migration_history table records every applied migration

set -euo pipefail

#  Config 

DB="${1:-${DATABASE_URL:-}}"

if [ -z "$DB" ]; then
  echo "Error: no database URL provided." >&2
  echo "Usage: ./database/migrate.sh <postgres://user@host/dbname>" >&2
  exit 1
fi

MIGRATIONS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/migrations" && pwd)"

#  SHA-256 helper (shasum on mac) 

sha256() {
  if command -v sha256sum &>/dev/null; then
    sha256sum "$1" | awk '{print $1}'
  else
    shasum -a 256 "$1" | awk '{print $1}'
  fi
}

#  Step 1: bootstrap migration_history 
# Runs outside any migration transaction so it's always safe to call.

echo "→ Connecting to: $DB"
echo ""

psql "$DB" -v ON_ERROR_STOP=1 -q <<'SQL'
CREATE TABLE IF NOT EXISTS migration_history (
    id         SERIAL       PRIMARY KEY,
    filename   VARCHAR(255) NOT NULL UNIQUE,
    checksum   CHAR(64)     NOT NULL,
    applied_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
SQL

echo "✓ migration_history ready"
echo ""

#  Step 2: apply each pending migration in filename order 

applied=0
skipped=0
failed=0

shopt -s nullglob
files=("$MIGRATIONS_DIR"/*.sql)
shopt -u nullglob

if [ ${#files[@]} -eq 0 ]; then
  echo "  (no migration files found in $MIGRATIONS_DIR)"
  exit 0
fi

for filepath in "${files[@]}"; do
  filename="$(basename "$filepath")"
  checksum="$(sha256 "$filepath")"

  # Check whether this migration was already applied
  already=$(psql "$DB" -tAq \
    -c "SELECT COUNT(*) FROM migration_history WHERE filename = '$filename'")

  if [ "$already" -gt 0 ]; then
    echo "  skip  $filename  (already applied)"
    skipped=$((skipped + 1))
    continue
  fi

  echo "  apply $filename ..."

  # Run the migration + tracking INSERT in a single transaction.
  #
  # --single-transaction  wraps the whole file in BEGIN / COMMIT
  # -v ON_ERROR_STOP=1    makes psql exit non-zero on the first error,
  #                       which leaves the transaction open; PostgreSQL
  #                       automatically rolls it back when the connection closes.
  #
  # Result: if any statement in the migration fails, nothing is committed —
  # neither the schema change nor the migration_history record.

  if psql "$DB" -v ON_ERROR_STOP=1 --single-transaction -q <<SQL
$(cat "$filepath")

INSERT INTO migration_history (filename, checksum)
VALUES ('$filename', '$checksum');
SQL
  then
    echo "  ✓     $filename"
    applied=$((applied + 1))
  else
    echo "  ✗     $filename  FAILED — rolled back" >&2
    failed=$((failed + 1))
    # Stop processing further migrations after a failure
    break
  fi
done

#  Summary 

echo ""
echo "────────────────────────────────"
echo "  Applied : $applied"
echo "  Skipped : $skipped"
[ "$failed" -gt 0 ] && echo "  Failed  : $failed" >&2
echo "────────────────────────────────"

[ "$failed" -eq 0 ]   # exit 1 if any migration failed
