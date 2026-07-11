import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { DRIZZLE } from '../../src/database/database.module.js';
import { AuditService } from '../../src/modules/audit/audit.service.js';
import { AuthService } from '../../src/modules/identity/application/auth.service.js';
import { JwtTokenService } from '../../src/modules/identity/infrastructure/jwt-token.service.js';
import { PasswordHasherService } from '../../src/modules/identity/infrastructure/password-hasher.service.js';
import { RefreshTokenRepository } from '../../src/modules/identity/infrastructure/refresh-token.repository.js';

describe('AuthService', () => {
  let authService: AuthService;
  let passwordHasher: jest.Mocked<Pick<PasswordHasherService, 'verify'>>;
  let jwtTokenService: jest.Mocked<Pick<JwtTokenService, 'signAccessToken'>>;
  let refreshTokenRepository: jest.Mocked<
    Pick<RefreshTokenRepository, 'store' | 'findValid' | 'revoke' | 'revokeFamily'>
  >;
  let db: {
    select: jest.Mock;
    update: jest.Mock;
  };

  const activeUser = {
    id: 'user-1',
    email: 'admin@school.qa',
    passwordHash: 'hash',
    status: 'active' as const,
    failedLoginAttempts: 0,
    lockedUntil: null,
    deletedAt: null,
  };

  beforeEach(async () => {
    db = {
      select: jest.fn(),
      update: jest
        .fn()
        .mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn() }) }),
    };

    passwordHasher = { verify: jest.fn() };
    jwtTokenService = { signAccessToken: jest.fn().mockReturnValue('access-token') };
    refreshTokenRepository = {
      store: jest.fn().mockResolvedValue('rt-1'),
      findValid: jest.fn(),
      revoke: jest.fn(),
      revokeFamily: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DRIZZLE, useValue: db },
        { provide: PasswordHasherService, useValue: passwordHasher },
        { provide: JwtTokenService, useValue: jwtTokenService },
        { provide: RefreshTokenRepository, useValue: refreshTokenRepository },
        { provide: AuditService, useValue: { append: jest.fn() } },
      ],
    }).compile();

    authService = module.get(AuthService);
  });

  function mockSelectChain(rows: unknown[]) {
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(rows),
      }),
    });
  }

  it('issues tokens on successful login', async () => {
    db.select
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([activeUser]),
        }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ status: 'active' }]),
        }),
      });

    passwordHasher.verify.mockResolvedValue(true);

    const result = await authService.login({
      email: 'admin@school.qa',
      password: 'SecurePass123!',
      tenantId: 'tenant-1',
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.tokenType).toBe('Bearer');
    expect(refreshTokenRepository.store).toHaveBeenCalled();
  });

  it('rejects invalid credentials for unknown email', async () => {
    mockSelectChain([]);

    await expect(
      authService.login({
        email: 'missing@school.qa',
        password: 'SecurePass123!',
        tenantId: 'tenant-1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects invalid email format', async () => {
    await expect(
      authService.login({
        email: 'not-an-email',
        password: 'SecurePass123!',
        tenantId: 'tenant-1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects inactive accounts', async () => {
    mockSelectChain([{ ...activeUser, status: 'inactive' }]);

    await expect(
      authService.login({
        email: 'admin@school.qa',
        password: 'SecurePass123!',
        tenantId: 'tenant-1',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects login without active membership', async () => {
    db.select
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([activeUser]),
        }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

    passwordHasher.verify.mockResolvedValue(true);

    await expect(
      authService.login({
        email: 'admin@school.qa',
        password: 'SecurePass123!',
        tenantId: 'tenant-1',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects wrong password and records failure', async () => {
    mockSelectChain([activeUser]);
    passwordHasher.verify.mockResolvedValue(false);

    await expect(
      authService.login({
        email: 'admin@school.qa',
        password: 'WrongPassword1!',
        tenantId: 'tenant-1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(db.update).toHaveBeenCalled();
  });

  it('rejects locked account within lockout window', async () => {
    mockSelectChain([
      {
        ...activeUser,
        status: 'locked',
        lockedUntil: new Date(Date.now() + 60_000),
      },
    ]);

    await expect(
      authService.login({
        email: 'admin@school.qa',
        password: 'SecurePass123!',
        tenantId: 'tenant-1',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rotates refresh token on valid refresh', async () => {
    refreshTokenRepository.findValid.mockResolvedValue({
      id: 'rt-1',
      userId: 'user-1',
      tenantId: 'tenant-1',
      familyId: 'family-1',
    });

    mockSelectChain([activeUser]);

    const result = await authService.refresh('valid-refresh-token');
    expect(result.accessToken).toBe('access-token');
    expect(refreshTokenRepository.revoke).toHaveBeenCalledWith('rt-1');
  });

  it('revokes refresh token on logout', async () => {
    refreshTokenRepository.findValid.mockResolvedValue({
      id: 'rt-1',
      userId: 'user-1',
      tenantId: 'tenant-1',
      familyId: 'family-1',
    });

    await authService.logout('valid-refresh-token');
    expect(refreshTokenRepository.revoke).toHaveBeenCalledWith('rt-1');
  });

  it('validates password policy', () => {
    expect(() => {
      authService.validatePassword('weak');
    }).toThrow();
  });
});
