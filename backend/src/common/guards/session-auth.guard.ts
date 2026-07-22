import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { resolveSession, toAuthenticatedUser } from '../auth/session';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const session = await resolveSession(request);

    if (!session?.user) {
      throw new UnauthorizedException('Invalid or missing authentication session');
    }

    request.authSession = session.session;
    request.user = toAuthenticatedUser(session.user);
    return true;
  }
}
