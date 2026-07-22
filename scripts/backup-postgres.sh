#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

backup_dir="${BACKUP_DIR:-./backups}"
mkdir -p "$backup_dir"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
output="$backup_dir/watani-$timestamp.dump"

pg_dump --format=custom --no-owner --no-privileges "$DATABASE_URL" --file "$output"
echo "Backup created: $output"
