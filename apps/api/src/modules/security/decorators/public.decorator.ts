import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marks route as exempt from JWT authentication */
export function Public(): MethodDecorator & ClassDecorator {
  return SetMetadata(IS_PUBLIC_KEY, true);
}
