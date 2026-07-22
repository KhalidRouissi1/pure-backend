# Pure release runbook

## Environments

Maintain separate PostgreSQL databases and credentials for development, preview, and production. Never copy production secrets into committed files. Configure mobile values through EAS environments and backend values through the hosting provider.

Production requires every variable documented in `backend/.env.example`, HTTPS for `BETTER_AUTH_URL`, explicit CORS origins, email verification, Cloudinary, and Resend. Mobile production requires the API URL, support email, policy URLs, and Sentry DSN. Store `SENTRY_AUTH_TOKEN` as a secret.

The backend production image is defined in `backend/Dockerfile` and targets Node.js 22. Run database migrations as a separate release step before shifting traffic to the new image.

## Database deployment

1. Create and verify a fresh backup.
2. Run `cd backend && npx prisma migrate deploy` against preview.
3. Run authentication, store application, image upload, cart, and checkout smoke tests.
4. Run the same migration against production during a monitored release window.
5. Do not use `prisma db push` in production.

## Backup and restore

Run `DATABASE_URL=... BACKUP_DIR=... bash scripts/backup-postgres.sh` before every migration and on a daily schedule. Encrypt backup storage and test restoration monthly.

Restore to a new database first:

```bash
createdb watani_restore_test
pg_restore --clean --if-exists --no-owner --dbname "$RESTORE_DATABASE_URL" backups/watani-TIMESTAMP.dump
```

Validate row counts and core flows before changing application traffic. Never test a restore over the active production database.

## Mobile release

1. Complete `docs/STORE_RELEASE_CHECKLIST.md`.
2. Run `npm run quality` from the repository root.
3. Run `cd mobile && npx expo export --platform all`.
4. Build preview with `eas build --profile preview --platform all` and test on physical iOS and Android devices.
5. Build with `eas build --profile production --platform all`.
6. Roll out gradually and watch Sentry, backend error rate, readiness, sign-in success, checkout success, and image upload failures.

## Rollback

Keep the previous backend image and mobile build available. Roll back application code before considering a database rollback. Prisma migrations should normally be corrected with a forward migration. Restore a backup only for confirmed destructive data loss and only after isolating writes.
