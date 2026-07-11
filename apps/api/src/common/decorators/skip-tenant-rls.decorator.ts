import { SetMetadata } from '@nestjs/common';

export const SKIP_TENANT_RLS_KEY = 'skipTenantRls';

/** Skips PostgreSQL RLS transaction wrapping for platform/system routes */
export const SkipTenantRls = (): MethodDecorator & ClassDecorator =>
  SetMetadata(SKIP_TENANT_RLS_KEY, true);
