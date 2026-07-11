import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import { JwtTokenService } from '../../src/modules/identity/infrastructure/jwt-token.service.js';
import { IS_PUBLIC_KEY } from '../../src/modules/security/decorators/public.decorator.js';
import { JwtAuthGuard } from '../../src/modules/security/guards/jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtTokenService: jest.Mocked<Pick<JwtTokenService, 'verifyAccessToken'>>;

  beforeEach(async () => {
    jwtTokenService = { verifyAccessToken: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        Reflector,
        { provide: JwtTokenService, useValue: jwtTokenService },
      ],
    }).compile();

    guard = module.get(JwtAuthGuard);
  });

  it('allows public routes without token', () => {
    const reflector = guard.reflector;
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    };

    expect(guard.canActivate(context as never)).toBe(true);
    expect(jwtTokenService.verifyAccessToken).not.toHaveBeenCalled();
  });

  it('rejects requests without bearer token', () => {
    const reflector = guard.reflector;
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    };

    expect(() => guard.canActivate(context as never)).toThrow(UnauthorizedException);
  });

  it('attaches user context from valid token', () => {
    const reflector = guard.reflector;
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    jwtTokenService.verifyAccessToken.mockReturnValue({
      sub: 'user-1',
      tenant_id: 'tenant-1',
      email: 'admin@school.qa',
    });

    const request = { headers: { authorization: 'Bearer valid-token' } };
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => request }),
    };

    expect(guard.canActivate(context as never)).toBe(true);
    expect(request.headers['x-tenant-id']).toBe('tenant-1');
    expect(request.headers['x-actor-id']).toBe('user-1');
  });
});

describe('IS_PUBLIC_KEY', () => {
  it('is defined for public decorator metadata', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });
});
