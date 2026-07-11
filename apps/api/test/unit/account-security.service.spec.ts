import { UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { DRIZZLE } from '../../src/database/database.module.js';
import { AccountSecurityService } from '../../src/modules/identity/application/account-security.service.js';
import { TenantSecurityPolicyService } from '../../src/modules/identity/application/tenant-security-policy.service.js';
import {
  PasswordHistoryRepository,
  SecurityTokenRepository,
} from '../../src/modules/identity/infrastructure/identity-security.repository.js';
import { PasswordHasherService } from '../../src/modules/identity/infrastructure/password-hasher.service.js';
import { SecurityEventRepository } from '../../src/modules/identity/infrastructure/security-event.repository.js';
import { NotificationService } from '../../src/modules/notification/application/notification.service.js';

describe('AccountSecurityService', () => {
  const previousReturnTokens = process.env['EMAIL_RETURN_TOKENS'];
  let service: AccountSecurityService;
  let securityTokenRepository: jest.Mocked<
    Pick<SecurityTokenRepository, 'create' | 'consume'>
  >;
  let passwordHistoryRepository: jest.Mocked<
    Pick<PasswordHistoryRepository, 'listHashes' | 'add'>
  >;
  let passwordHasher: jest.Mocked<Pick<PasswordHasherService, 'hash' | 'verify'>>;
  let db: { select: jest.Mock; update: jest.Mock };

  beforeEach(async () => {
    process.env['EMAIL_RETURN_TOKENS'] = 'true';
    db = {
      select: jest.fn(),
      update: jest
        .fn()
        .mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn() }) }),
    };

    securityTokenRepository = {
      create: jest.fn(),
      consume: jest.fn(),
    };
    passwordHistoryRepository = {
      listHashes: jest.fn().mockResolvedValue([]),
      add: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn().mockResolvedValue('new-hash'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountSecurityService,
        { provide: DRIZZLE, useValue: db },
        { provide: SecurityTokenRepository, useValue: securityTokenRepository },
        { provide: PasswordHistoryRepository, useValue: passwordHistoryRepository },
        { provide: PasswordHasherService, useValue: passwordHasher },
        { provide: SecurityEventRepository, useValue: { record: jest.fn() } },
        {
          provide: NotificationService,
          useValue: {
            queueEmail: jest.fn().mockResolvedValue({ queued: true, outboxId: '1' }),
          },
        },
        {
          provide: TenantSecurityPolicyService,
          useValue: {
            getPolicy: jest.fn().mockResolvedValue({
              tenantId: 'tenant-1',
              mfaRequired: false,
              passwordMinLength: 12,
              passwordExpiryDays: 90,
              passwordHistoryCount: 5,
              maxActiveSessions: 10,
              sessionIdleTimeoutMinutes: 480,
            }),
          },
        },
      ],
    }).compile();

    service = module.get(AccountSecurityService);
  });

  afterEach(() => {
    if (previousReturnTokens === undefined) {
      delete process.env['EMAIL_RETURN_TOKENS'];
    } else {
      process.env['EMAIL_RETURN_TOKENS'] = previousReturnTokens;
    }
  });

  it('issues email verification token', async () => {
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ id: 'user-1', emailVerifiedAt: null }]),
      }),
    });

    const result = await service.requestEmailVerification('user-1');
    expect(result.token ?? result).toBeDefined();
    expect(securityTokenRepository.create).toHaveBeenCalled();
  });

  it('confirms email verification', async () => {
    securityTokenRepository.consume.mockResolvedValue({
      userId: 'user-1',
      purpose: 'email_verification',
    });

    await service.confirmEmailVerification('token');
    expect(db.update).toHaveBeenCalled();
  });

  it('rejects invalid verification token', async () => {
    securityTokenRepository.consume.mockResolvedValue(null);
    await expect(service.confirmEmailVerification('bad')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('asserts password not expired for active users', () => {
    expect(() => {
      service.assertPasswordNotExpired({
        passwordExpiresAt: new Date(Date.now() + 86_400_000),
      });
    }).not.toThrow();
  });

  it('rejects expired passwords', () => {
    expect(() => {
      service.assertPasswordNotExpired({
        passwordExpiresAt: new Date(Date.now() - 1_000),
      });
    }).toThrow(UnauthorizedException);
  });

  it('requests password reset for known user', async () => {
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ id: 'user-1', email: 'user@test.qa' }]),
      }),
    });

    const result = await service.requestPasswordReset('user@test.qa');
    expect(result.token).toBeTruthy();
  });

  it('returns empty result for unknown email on password reset', async () => {
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      }),
    });

    const result = await service.requestPasswordReset('missing@test.qa');
    expect(result).toEqual({});
  });

  it('confirms password reset and changes password', async () => {
    securityTokenRepository.consume.mockResolvedValue({
      userId: 'user-1',
      purpose: 'password_reset',
    });
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest
          .fn()
          .mockResolvedValue([{ id: 'user-1', passwordHash: 'old-hash' }]),
      }),
    });
    passwordHasher.verify.mockResolvedValue(false);

    await service.confirmPasswordReset('token', 'SecurePass123!');
    expect(passwordHasher.hash).toHaveBeenCalled();
    expect(db.update).toHaveBeenCalled();
  });

  it('rejects password reuse in changePassword', async () => {
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest
          .fn()
          .mockResolvedValue([{ id: 'user-1', passwordHash: 'old-hash' }]),
      }),
    });
    passwordHasher.verify.mockResolvedValue(true);

    await expect(service.changePassword('user-1', 'SecurePass123!')).rejects.toThrow(
      'Password was used recently',
    );
  });
});
