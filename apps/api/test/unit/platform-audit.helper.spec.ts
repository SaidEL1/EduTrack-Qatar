import { buildAuditEntry } from '../../src/modules/platform/platform-audit.helper.js';

describe('buildAuditEntry', () => {
  it('omits correlationId when not provided', () => {
    const entry = buildAuditEntry({
      tenantId: 'tenant-1',
      action: 'test.action',
      entityType: 'test',
      entityId: '1',
    });

    expect(entry.correlationId).toBeUndefined();
  });

  it('includes correlationId when provided', () => {
    const entry = buildAuditEntry(
      {
        tenantId: 'tenant-1',
        action: 'test.action',
        entityType: 'test',
        entityId: '1',
      },
      'corr-123',
    );

    expect(entry.correlationId).toBe('corr-123');
  });
});
