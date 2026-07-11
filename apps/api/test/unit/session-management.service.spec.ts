import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { SessionManagementService } from '../../src/modules/identity/application/session-management.service.js';
import { TenantSecurityPolicyService } from '../../src/modules/identity/application/tenant-security-policy.service.js';
import { UserSessionRepository } from '../../src/modules/identity/infrastructure/identity-security.repository.js';
import { RefreshTokenRepository } from '../../src/modules/identity/infrastructure/refresh-token.repository.js';

describe('SessionManagementService', () => {
  let service: SessionManagementService;
  let userSessionRepository: jest.Mocked<
    Pick<
      UserSessionRepository,
      'upsert' | 'listActive' | 'revoke' | 'revokeAll' | 'revokeByFamilyId'
    >
  >;
  let refreshTokenRepository: jest.Mocked<
    Pick<RefreshTokenRepository, 'revokeFamily' | 'revokeAllForUser'>
  >;

  beforeEach(async () => {
    userSessionRepository = {
      upsert: jest.fn(),
      listActive: jest.fn().mockResolvedValue([]),
      revoke: jest.fn(),
      revokeAll: jest.fn(),
      revokeByFamilyId: jest.fn(),
    };
    refreshTokenRepository = {
      revokeFamily: jest.fn(),
      revokeAllForUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionManagementService,
        { provide: UserSessionRepository, useValue: userSessionRepository },
        { provide: RefreshTokenRepository, useValue: refreshTokenRepository },
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

    service = module.get(SessionManagementService);
  });

  it('tracks session with device label', async () => {
    await service.trackSession({
      userId: 'user-1',
      tenantId: 'tenant-1',
      familyId: 'family-1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
    });

    expect(userSessionRepository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        deviceLabel: 'Windows',
      }),
    );
  });

  it('revokes session and token family', async () => {
    userSessionRepository.revoke.mockResolvedValue('family-1');

    await service.revokeSession('user-1', 'tenant-1', 'session-1');
    expect(refreshTokenRepository.revokeFamily).toHaveBeenCalledWith(
      'family-1',
      'user-1',
    );
  });

  it('throws when session not found', async () => {
    userSessionRepository.revoke.mockResolvedValue(null);
    await expect(
      service.revokeSession('user-1', 'tenant-1', 'missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('revokes all sessions for user', async () => {
    userSessionRepository.revokeAll.mockResolvedValue(['family-1', 'family-2']);

    const count = await service.revokeAllSessions('user-1', 'tenant-1');
    expect(count).toBe(2);
    expect(refreshTokenRepository.revokeAllForUser).toHaveBeenCalledWith(
      'user-1',
      'tenant-1',
    );
  });
});
