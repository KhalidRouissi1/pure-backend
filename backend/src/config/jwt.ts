export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRATION || '7d',
  algorithm: 'HS256' as const,
};

export const getJwtExpiresIn = (): string => {
  return jwtConfig.expiresIn;
};

export const getJwtSecret = (): string => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }
  return jwtConfig.secret;
};
