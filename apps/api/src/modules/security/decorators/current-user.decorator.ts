import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { getAuthUser } from '../types/authenticated-request.js';
import type { AuthenticatedUser } from '../types/authenticated-user.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<Request>();
    const user = getAuthUser(request);

    if (!user) {
      throw new Error('Authenticated user not found on request');
    }

    return user;
  },
);
