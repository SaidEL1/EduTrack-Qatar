import { Test, type TestingModule } from '@nestjs/testing';

import { DRIZZLE } from '../../src/database/database.module.js';
import { SecurityDashboardService } from '../../src/modules/identity/application/security-dashboard.service.js';

describe('SecurityDashboardService', () => {
  let service: SecurityDashboardService;
  let db: { select: jest.Mock };

  beforeEach(async () => {
    db = { select: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityDashboardService, { provide: DRIZZLE, useValue: db }],
    }).compile();

    service = module.get(SecurityDashboardService);
  });

  it('builds dashboard summary', async () => {
    db.select
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ value: 3 }]),
        }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockResolvedValue([
              { outcome: 'success', value: 5 },
              { outcome: 'failure', value: 2 },
            ]),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ value: 1 }]),
        }),
      });

    const summary = await service.getSummary('tenant-1');
    expect(summary.activeSessions).toBe(3);
    expect(summary.successfulLogins24h).toBe(5);
    expect(summary.failedLogins24h).toBe(2);
  });

  it('returns login analytics grouped by outcome', async () => {
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          groupBy: jest.fn().mockResolvedValue([
            { outcome: 'success', value: 4 },
            { outcome: 'failure', value: 1 },
          ]),
        }),
      }),
    });

    const analytics = await service.getLoginAnalytics('tenant-1', 7);
    expect(analytics).toEqual([
      { outcome: 'success', count: 4 },
      { outcome: 'failure', count: 1 },
    ]);
  });

  it('returns failed login report and active sessions', async () => {
    db.select
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ id: 'failed-1' }]),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([{ id: 'session-1' }]),
          }),
        }),
      });

    await expect(service.getFailedLoginReport('tenant-1')).resolves.toEqual([
      { id: 'failed-1' },
    ]);
    await expect(service.getActiveSessions('tenant-1')).resolves.toEqual([
      { id: 'session-1' },
    ]);
  });
});
