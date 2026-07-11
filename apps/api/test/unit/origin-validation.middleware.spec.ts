import { ForbiddenException } from '@nestjs/common';

import { OriginValidationMiddleware } from '../../src/common/middleware/origin-validation.middleware.js';

describe('OriginValidationMiddleware', () => {
  const middleware = new OriginValidationMiddleware();
  const originalCors = process.env['CORS_ORIGINS'];

  afterEach(() => {
    if (originalCors === undefined) {
      delete process.env['CORS_ORIGINS'];
    } else {
      process.env['CORS_ORIGINS'] = originalCors;
    }
  });

  it('allows safe GET requests without origin checks', () => {
    const next = jest.fn();
    middleware.use(
      {
        method: 'GET',
        headers: {},
        originalUrl: '/identity/users',
        path: '/identity/users',
      } as never,
      {} as never,
      next,
    );
    expect(next).toHaveBeenCalled();
  });

  it('allows bearer requests without origin header', () => {
    const next = jest.fn();
    middleware.use(
      {
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        originalUrl: '/identity/users',
        path: '/identity/users',
      } as never,
      {} as never,
      next,
    );
    expect(next).toHaveBeenCalled();
  });

  it('rejects state-changing requests from disallowed origins', () => {
    process.env['CORS_ORIGINS'] = 'http://localhost:3000';
    const next = jest.fn();
    expect(() => {
      middleware.use(
        {
          method: 'POST',
          headers: { origin: 'http://evil.example' },
          originalUrl: '/identity/users',
          path: '/identity/users',
        } as never,
        {} as never,
        next,
      );
    }).toThrow(ForbiddenException);
  });

  it('exempts login routes from origin validation', () => {
    process.env['CORS_ORIGINS'] = 'http://localhost:3000';
    const next = jest.fn();
    middleware.use(
      {
        method: 'POST',
        headers: { origin: 'http://evil.example' },
        originalUrl: '/auth/login',
        path: '/auth/login',
      } as never,
      {} as never,
      next,
    );
    expect(next).toHaveBeenCalled();
  });
});
