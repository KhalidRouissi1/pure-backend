import type { Request } from 'express';

export type AuthRole = 'USER' | 'SELLER' | 'ADMIN';

export interface AuthenticatedUser {
  sub: string;
  id: string;
  email: string;
  role: AuthRole;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  authSession?: unknown;
}

export interface OptionallyAuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  authSession?: unknown;
}
