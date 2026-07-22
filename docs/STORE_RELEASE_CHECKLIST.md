# Apple and Google release checklist

## Required external setup

- [ ] Replace `example.com` policy URLs with public HTTPS pages matching the bundled policies.
- [ ] Confirm `support@pure.app` or set the real support email in EAS.
- [ ] Create Apple App Store Connect and Google Play Console records for `com.pure.localmarketplace`.
- [ ] Create the EAS project and add its project ID to Expo configuration.
- [ ] Configure Sentry organization, project, DSN, and source-map token.
- [ ] Configure production PostgreSQL, Resend, Cloudinary, API domain, and explicit CORS origins.
- [ ] Apply `20260713180000_better_auth` and `20260713233000_product_inventory` with `prisma migrate deploy` after a backup.

## Product and compliance

- [ ] Test sign-up, verification, login, password reset, logout, and account deletion on physical devices.
- [ ] Verify deleted accounts and their stores/products disappear as described.
- [ ] Complete Apple privacy nutrition labels and Google Data Safety using the actual production providers.
- [ ] Declare account data, contact details, precise/approximate location, photos, orders, diagnostics, and identifiers where applicable.
- [ ] Confirm photo and location prompts accurately describe their use.
- [ ] Provide reviewer credentials for buyer, approved seller, and admin accounts without embedding them in the app.
- [ ] Confirm there are no demo buttons, fake payments, broken links, or placeholder content.

## Quality and operations

- [ ] CI is green and both platform exports succeed.
- [ ] Test on a small phone, tablet, current iPhone, and current Android device in English and Arabic/RTL.
- [ ] Verify poor-network, offline, expired-session, upload failure, and empty-state behavior.
- [ ] Verify `/api/health/live` and `/api/health/ready` from production monitoring.
- [ ] Verify a controlled Sentry test event and symbolicated stack trace, then remove the test trigger.
- [ ] Confirm daily encrypted backups, retention, restore test, alert routing, and rollback owner.
- [ ] Use staged rollout rather than immediate 100% release.
