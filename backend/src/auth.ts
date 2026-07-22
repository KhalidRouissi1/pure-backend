import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { expo } from '@better-auth/expo';
import * as bcrypt from 'bcryptjs';

export const authPrisma = new PrismaClient();

const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3000/api/auth';
export const authSecret =
  process.env.BETTER_AUTH_SECRET ||
  (process.env.NODE_ENV === 'production' ? '' : 'development-only-better-auth-secret-change-me');

if (authSecret.length < 32) {
  throw new Error('BETTER_AUTH_SECRET must be at least 32 characters');
}
const productionOrigins = (process.env.AUTH_TRUSTED_ORIGINS || 'pure://')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

async function sendAuthEmail(options: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'RESEND_API_KEY and AUTH_EMAIL_FROM are required to send authentication email',
      );
    }
    console.warn(
      `[auth-email] ${options.subject} for ${options.to}: email provider is not configured`,
    );
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, ...options }),
  });

  if (!response.ok) throw new Error(`Authentication email failed with status ${response.status}`);
}

export const auth = betterAuth({
  appName: 'Pure',
  baseURL,
  secret: authSecret,
  database: prismaAdapter(authPrisma, { provider: 'postgresql' }),
  trustedOrigins: [
    ...productionOrigins,
    ...(process.env.NODE_ENV === 'development' ? ['exp://', 'exp://**', 'http://localhost:*'] : []),
  ],
  plugins: [expo()],
  advanced: {
    database: { generateId: () => crypto.randomUUID() },
    cookiePrefix: 'pure',
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: process.env.AUTH_REQUIRE_EMAIL_VERIFICATION === 'true',
    revokeSessionsOnPasswordReset: true,
    password: {
      hash: (password) => bcrypt.hash(password, 12),
      verify: ({ hash, password }) => bcrypt.compare(password, hash),
    },
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: 'Reset your Pure password',
        html: `<p>Use this link to reset your Pure password:</p><p><a href="${url}">${url}</a></p>`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: process.env.AUTH_REQUIRE_EMAIL_VERIFICATION === 'true',
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: 'Verify your Pure email',
        html: `<p>Verify your email to finish creating your Pure account:</p><p><a href="${url}">${url}</a></p>`,
      });
    },
  },
  user: {
    fields: { image: 'avatarUrl' },
    additionalFields: {
      role: {
        type: ['USER', 'SELLER', 'ADMIN'],
        required: true,
        defaultValue: 'USER',
        input: false,
      },
      city: { type: 'string', required: false },
      phone: { type: 'string', required: false },
    },
    deleteUser: { enabled: true },
  },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  rateLimit: { enabled: true, window: 60, max: 10 },
});
