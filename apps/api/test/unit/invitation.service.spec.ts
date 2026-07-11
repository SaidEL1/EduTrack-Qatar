import { UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { DRIZZLE } from '../../src/database/database.module.js';
import { AuditService } from '../../src/modules/audit/audit.service.js';
import { InvitationService } from '../../src/modules/identity/application/invitation.service.js';
import { UserManagementService } from '../../src/modules/identity/application/user-management.service.js';
import { InvitationRepository } from '../../src/modules/identity/infrastructure/identity-security.repository.js';
import { RbacRepository } from '../../src/modules/identity/infrastructure/rbac.repository.js';
import { NotificationService } from '../../src/modules/notification/application/notification.service.js';

describe('InvitationService', () => {
  const previousReturnTokens = process.env['EMAIL_RETURN_TOKENS'];
  let service: InvitationService;
  let invitationRepository: jest.Mocked<
    Pick<
      InvitationRepository,
      'create' | 'listByTenant' | 'findByToken' | 'markAccepted'
    >
  >;
  let userManagementService: jest.Mocked<Pick<UserManagementService, 'createUser'>>;
  let db: { select: jest.Mock; insert: jest.Mock; update: jest.Mock };

  beforeEach(async () => {
    process.env['EMAIL_RETURN_TOKENS'] = 'true';
    db = {
      select: jest.fn(),
      insert: jest.fn().mockReturnValue({ values: jest.fn() }),
      update: jest
        .fn()
        .mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn() }) }),
    };

    invitationRepository = {
      create: jest.fn().mockResolvedValue({ id: 'inv-1' }),
      listByTenant: jest.fn().mockResolvedValue([]),
      findByToken: jest.fn(),
      markAccepted: jest.fn(),
    };
    userManagementService = {
      createUser: jest.fn().mockResolvedValue({ id: 'user-new' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationService,
        { provide: DRIZZLE, useValue: db },
        { provide: InvitationRepository, useValue: invitationRepository },
        { provide: UserManagementService, useValue: userManagementService },
        { provide: RbacRepository, useValue: { assignRole: jest.fn() } },
        { provide: AuditService, useValue: { append: jest.fn() } },
        {
          provide: NotificationService,
          useValue: {
            queueEmail: jest.fn().mockResolvedValue({ queued: true, outboxId: '1' }),
          },
        },
      ],
    }).compile();

    service = module.get(InvitationService);
  });

  afterEach(() => {
    if (previousReturnTokens === undefined) {
      delete process.env['EMAIL_RETURN_TOKENS'];
    } else {
      process.env['EMAIL_RETURN_TOKENS'] = previousReturnTokens;
    }
  });

  it('creates invitation with token', async () => {
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ name: 'Test School' }]),
      }),
    });

    const result = await service.createInvitation({
      tenantId: 'tenant-1',
      email: 'teacher@school.qa',
      invitedBy: 'admin-1',
    });

    expect(result.token).toBeTruthy();
    expect(invitationRepository.create).toHaveBeenCalled();
  });

  it('accepts invitation for new user', async () => {
    invitationRepository.findByToken.mockResolvedValue({
      id: 'inv-1',
      tenantId: 'tenant-1',
      email: 'teacher@school.qa',
      status: 'pending',
      expiresAt: new Date(Date.now() + 60_000),
      roleId: null,
    });
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      }),
    });

    const result = await service.acceptInvitation({
      token: 'invite-token',
      password: 'SecurePass123!',
      firstName: 'Teacher',
      lastName: 'One',
    });

    expect(result.userId).toBe('user-new');
    expect(userManagementService.createUser).toHaveBeenCalled();
  });

  it('rejects expired invitation', async () => {
    invitationRepository.findByToken.mockResolvedValue({
      id: 'inv-1',
      tenantId: 'tenant-1',
      email: 'teacher@school.qa',
      status: 'pending',
      expiresAt: new Date(Date.now() - 1_000),
      roleId: null,
    });

    await expect(
      service.acceptInvitation({
        token: 'expired',
        password: 'SecurePass123!',
        firstName: 'Teacher',
        lastName: 'One',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts invitation for existing user without membership', async () => {
    invitationRepository.findByToken.mockResolvedValue({
      id: 'inv-1',
      tenantId: 'tenant-1',
      email: 'existing@test.qa',
      status: 'pending',
      expiresAt: new Date(Date.now() + 60_000),
      roleId: 'role-1',
    });
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest
          .fn()
          .mockResolvedValue([{ id: 'user-existing', email: 'existing@test.qa' }]),
      }),
    });

    const result = await service.acceptInvitation({
      token: 'invite-token',
      password: 'SecurePass123!',
      firstName: 'Existing',
      lastName: 'User',
    });

    expect(result.userId).toBe('user-existing');
    expect(userManagementService.createUser).not.toHaveBeenCalled();
  });
});
