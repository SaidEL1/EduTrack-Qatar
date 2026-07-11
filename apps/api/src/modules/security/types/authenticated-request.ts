import type { Request } from 'express';

import type { AuthenticatedUser } from '../types/authenticated-user.js';

export const AUTH_USER_KEY = 'authUser';

export interface AuthenticatedRequest extends Request {
  [AUTH_USER_KEY]?: AuthenticatedUser;
}

export function getAuthUser(request: Request): AuthenticatedUser | undefined {
  return (request as AuthenticatedRequest)[AUTH_USER_KEY];
}

export function setAuthUser(request: Request, user: AuthenticatedUser): void {
  (request as AuthenticatedRequest)[AUTH_USER_KEY] = user;
}
