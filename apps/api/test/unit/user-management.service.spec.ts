import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { DRIZZLE } from '../../src/database/database.module.js';
import { AuditService } from '../../src/modules/audit/audit.service.js';
import { UserManagementService } from '../../src/modules/identity/application/user-management.service.js';
import { PasswordHasherService } from '../../src/modules/identity/infrastructure/password-hasher.service.js';
import { RbacRepository } from '../../src/modules/identity/infrastructure/rbac.repository.js';

describe('UserManagementService', () => {
  let service: UserManagementService;
  let db: {
    select: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
  };
  let rbacRepository: jest.Mocked<Pick<RbacRepository, 'assignRole' | 'removeRole'>>;

  beforeEach(async () => {
    db = {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
    };

    rbacRepository = {
      assignRole: jest.fn(),
      removeRole: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserManagementService,
        { provide: DRIZZLE, useValue: db },
        {
          provide: PasswordHasherService,
          useValue: { hash: jest.fn().mockResolvedValue('hashed-password') },
        },
        { provide: RbacRepository, useValue: rbacRepository },
        { provide: AuditService, useValue: { append: jest.fn() } },
      ],
    }).compile();

    service = module.get(UserManagementService);
  });

  it('creates user with profile and membership', async () => {
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      }),
    });

    db.insert
      .mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest
            .fn()
            .mockResolvedValue([
              { id: 'user-1', email: 'teacher@school.qa', status: 'active' },
            ]),
        }),
      })
      .mockReturnValueOnce({ values: jest.fn().mockResolvedValue(undefined) })
      .mockReturnValueOnce({ values: jest.fn().mockResolvedValue(undefined) });

    db.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      }),
    });

    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([
              {
                user: {
                  id: 'user-1',
                  email: 'teacher@school.qa',
                  status: 'active',
                  lastLoginAt: null,
                  createdAt: new Date(),
                },
                profile: {
                  firstName: 'Teacher',
                  lastName: 'One',
                  displayName: null,
                  locale: 'en-QA',
                  timezone: 'Asia/Qatar',
                },
                membership: { status: 'active' },
              },
            ]),
          }),
        }),
      }),
    });

    const result = await service.createUser({
      tenantId: 'tenant-1',
      email: 'teacher@school.qa',
      password: 'SecurePass123!',
      firstName: 'Teacher',
      lastName: 'One',
      roleId: 'role-1',
      actorId: 'admin-1',
    });

    expect(result.email).toBe('teacher@school.qa');
    expect(rbacRepository.assignRole).toHaveBeenCalled();
  });

  it('rejects duplicate email', async () => {
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ id: 'existing' }]),
      }),
    });

    await expect(
      service.createUser({
        tenantId: 'tenant-1',
        email: 'teacher@school.qa',
        password: 'SecurePass123!',
        firstName: 'Teacher',
        lastName: 'One',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('deactivates user', async () => {
    const activeRow = {
      user: {
        id: 'user-1',
        email: 'a@b.qa',
        status: 'active',
        lastLoginAt: null,
        createdAt: new Date(),
      },
      profile: {
        firstName: 'A',
        lastName: 'B',
        displayName: null,
        locale: 'en-QA',
        timezone: 'Asia/Qatar',
      },
      membership: { status: 'active' },
    };
    const inactiveRow = {
      ...activeRow,
      user: { ...activeRow.user, status: 'inactive' as const },
    };

    db.select
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([activeRow]),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([inactiveRow]),
            }),
          }),
        }),
      });

    db.update.mockReturnValue({
      set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
    });

    const result = await service.deactivateUser('tenant-1', 'user-1', 'admin-1');
    expect(result.status).toBe('inactive');
  });

  it('throws when user not found', async () => {
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });

    await expect(service.getUser('tenant-1', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lists users for tenant', async () => {
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([
              {
                user: { id: 'user-1', email: 'a@b.qa', status: 'active' },
                profile: { firstName: 'A', lastName: 'B', displayName: null },
                membership: { status: 'active' },
              },
            ]),
          }),
        }),
      }),
    });

    const users = await service.listUsers('tenant-1');
    expect(users).toHaveLength(1);
  });

  it('reactivates user', async () => {
    const inactiveRow = {
      user: {
        id: 'user-1',
        email: 'a@b.qa',
        status: 'inactive',
        lastLoginAt: null,
        createdAt: new Date(),
      },
      profile: {
        firstName: 'A',
        lastName: 'B',
        displayName: null,
        locale: 'en-QA',
        timezone: 'Asia/Qatar',
      },
      membership: { status: 'active' },
    };
    const activeRow = {
      ...inactiveRow,
      user: { ...inactiveRow.user, status: 'active' as const },
    };

    db.select
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([inactiveRow]),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([activeRow]),
            }),
          }),
        }),
      });

    db.update.mockReturnValue({
      set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
    });

    const result = await service.reactivateUser('tenant-1', 'user-1', 'admin-1');
    expect(result.status).toBe('active');
  });

  it('assigns and removes roles', async () => {
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([
              {
                user: {
                  id: 'user-1',
                  email: 'a@b.qa',
                  status: 'active',
                  lastLoginAt: null,
                  createdAt: new Date(),
                },
                profile: {
                  firstName: 'A',
                  lastName: 'B',
                  displayName: null,
                  locale: 'en-QA',
                  timezone: 'Asia/Qatar',
                },
                membership: { status: 'active' },
              },
            ]),
          }),
        }),
      }),
    });

    await service.assignRole('tenant-1', 'user-1', 'role-1', 'admin-1');
    await service.removeRole('tenant-1', 'user-1', 'role-1', 'admin-1');

    expect(rbacRepository.assignRole).toHaveBeenCalled();
    expect(rbacRepository.removeRole).toHaveBeenCalled();
  });
});
