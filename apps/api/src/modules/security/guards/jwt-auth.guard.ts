import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { TENANT_ID_HEADER } from '../../../common/middleware/tenant-context.middleware.js';
import { JwtTokenService } from '../../identity/infrastructure/jwt-token.service.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { setAuthUser } from '../types/authenticated-request.js';
import type { AuthenticatedUser } from '../types/authenticated-user.js';

/** Validates JWT Bearer tokens and attaches auth context — TDR-011 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.slice('Bearer '.length);

    try {
      const claims = this.jwtTokenService.verifyAccessToken(token);
      const user: AuthenticatedUser = {
        userId: claims.sub,
        tenantId: claims.tenant_id,
        email: claims.email,
      };

      setAuthUser(request, user);
      request.headers[TENANT_ID_HEADER] = claims.tenant_id;
      request.headers['x-actor-id'] = claims.sub;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
