export function validateProductionEnvironment(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const required = [
    'DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',
    'AUTH_TRUSTED_ORIGINS',
    'CORS_ORIGIN',
    'RESEND_API_KEY',
    'AUTH_EMAIL_FROM',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing production environment variables: ${missing.join(', ')}`);
  }

  if (!process.env.BETTER_AUTH_URL?.startsWith('https://')) {
    throw new Error('BETTER_AUTH_URL must use HTTPS in production');
  }
  if (process.env.AUTH_REQUIRE_EMAIL_VERIFICATION !== 'true') {
    throw new Error('AUTH_REQUIRE_EMAIL_VERIFICATION must be true in production');
  }
  if (process.env.CORS_ORIGIN?.includes('*')) {
    throw new Error('CORS_ORIGIN cannot contain a wildcard in production');
  }
}
