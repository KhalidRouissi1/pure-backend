import type { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../../auth';
import type { AuthenticatedUser, AuthRole } from './authenticated-request';

const validRoles = new Set<AuthRole>(['USER', 'SELLER', 'ADMIN']);

export async function resolveSession(request: Request) {
  return auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
}

export function toAuthenticatedUser(user: { id: string; email: string; role?: unknown }): AuthenticatedUser {
  const role = typeof user.role === 'string' && validRoles.has(user.role as AuthRole)
    ? (user.role as AuthRole)
    : 'USER';

  return { sub: user.id, id: user.id, email: user.email, role };
}
