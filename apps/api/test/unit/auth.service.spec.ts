import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { DRIZZLE } from '../../src/database/database.module.js';
import { AuditService } from '../../src/modules/audit/audit.service.js';
import { AccountSecurityService } from '../../src/modules/identity/application/account-security.service.js';
import { AuthService } from '../../src/modules/identity/application/auth.service.js';
import { MfaService } from '../../src/modules/identity/application/mfa.service.js';
import { SessionManagementService } from '../../src/modules/identity/application/session-management.service.js';
import { TenantSecurityPolicyService } from '../../src/modules/identity/application/tenant-security-policy.service.js';
import { JwtTokenService } from '../../src/modules/identity/infrastructure/jwt-token.service.js';
import { PasswordHasherService } from '../../src/modules/identity/infrastructure/password-hasher.service.js';
import { RefreshTokenRepository } from '../../src/modules/identity/infrastructure/refresh-token.repository.js';
import {
  LoginEventRepository,
  SecurityEventRepository,
} from '../../src/modules/identity/infrastructure/security-event.repository.js';

describe('AuthService', () => {
  let authService: AuthService;
  let passwordHasher: jest.Mocked<Pick<PasswordHasherService, 'verify'>>;
  let jwtTokenService: jest.Mocked<Pick<JwtTokenService, 'signAccessToken'>>;
  let refreshTokenRepository: jest.Mocked<
    Pick<
      RefreshTokenRepository,
      'store' | 'findValid' | 'findByHash' | 'revoke' | 'revokeFamily'
    >
  >;
  let mfaService: jest.Mocked<Pick<MfaService, 'createLoginChallenge'>>;
  let accountSecurityService: jest.Mocked<
    Pick<AccountSecurityService, 'assertPasswordNotExpired'>
  >;
  let sessionManagementService: jest.Mocked<
    Pick<SessionManagementService, 'trackSession' | 'revokeByFamilyId'>
  >;
  let loginEventRepository: jest.Mocked<Pick<LoginEventRepository, 'record'>>;
  let securityEventRepository: jest.Mocked<Pick<SecurityEventRepository, 'record'>>;
  let tenantSecurityPolicyService: jest.Mocked<
    Pick<TenantSecurityPolicyService, 'getPolicy'>
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
    mfaEnabled: false,
    passwordExpiresAt: null,
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
      findByHash: jest.fn(),
      revoke: jest.fn(),
      revokeFamily: jest.fn(),
    };
    mfaService = {
      createLoginChallenge: jest.fn().mockResolvedValue('challenge-token'),
    };
    accountSecurityService = { assertPasswordNotExpired: jest.fn() };
    sessionManagementService = {
      trackSession: jest.fn().mockResolvedValue(undefined),
      revokeByFamilyId: jest.fn().mockResolvedValue(undefined),
    };
    loginEventRepository = { record: jest.fn().mockResolvedValue(undefined) };
    securityEventRepository = { record: jest.fn().mockResolvedValue(undefined) };
    tenantSecurityPolicyService = {
      getPolicy: jest.fn().mockResolvedValue({
        tenantId: 'tenant-1',
        mfaRequired: false,
        passwordMinLength: 12,
        passwordExpiryDays: 90,
        passwordHistoryCount: 5,
        maxActiveSessions: 10,
        sessionIdleTimeoutMinutes: 480,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DRIZZLE, useValue: db },
        { provide: PasswordHasherService, useValue: passwordHasher },
        { provide: JwtTokenService, useValue: jwtTokenService },
        { provide: RefreshTokenRepository, useValue: refreshTokenRepository },
        { provide: AuditService, useValue: { append: jest.fn() } },
        { provide: MfaService, useValue: mfaService },
        { provide: AccountSecurityService, useValue: accountSecurityService },
        { provide: SessionManagementService, useValue: sessionManagementService },
        { provide: LoginEventRepository, useValue: loginEventRepository },
        { provide: SecurityEventRepository, useValue: securityEventRepository },
        { provide: TenantSecurityPolicyService, useValue: tenantSecurityPolicyService },
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
    expect(sessionManagementService.trackSession).toHaveBeenCalled();
  });

  it('returns MFA challenge when MFA is enabled', async () => {
    db.select
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ ...activeUser, mfaEnabled: true }]),
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

    expect(result).toEqual({
      mfaRequired: true,
      challengeToken: 'challenge-token',
      expiresIn: 300,
    });
    expect(mfaService.createLoginChallenge).toHaveBeenCalled();
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
    expect(loginEventRepository.record).toHaveBeenCalled();
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
    refreshTokenRepository.findByHash.mockResolvedValue({
      id: 'rt-1',
      userId: 'user-1',
      tenantId: 'tenant-1',
      familyId: 'family-1',
      revokedAt: null,
    });
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

  it('detects refresh token reuse and revokes family', async () => {
    refreshTokenRepository.findByHash.mockResolvedValue({
      id: 'rt-1',
      userId: 'user-1',
      tenantId: 'tenant-1',
      familyId: 'family-1',
      revokedAt: new Date(),
    });

    await expect(authService.refresh('reused-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(refreshTokenRepository.revokeFamily).toHaveBeenCalledWith(
      'family-1',
      'user-1',
    );
    expect(securityEventRepository.record).toHaveBeenCalled();
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
    expect(sessionManagementService.revokeByFamilyId).toHaveBeenCalledWith('family-1');
  });

  it('validates password policy', () => {
    expect(() => {
      authService.validatePassword('weak');
    }).toThrow();
  });
});
