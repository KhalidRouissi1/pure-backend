import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { OptionallyAuthenticatedRequest } from '../auth/authenticated-request';
import { resolveSession, toAuthenticatedUser } from '../auth/session';

@Injectable()
export class OptionalSessionAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<OptionallyAuthenticatedRequest>();
    const session = await resolveSession(request);

    if (session?.user) {
      request.authSession = session.session;
      request.user = toAuthenticatedUser(session.user);
    }

    return true;
  }
}
