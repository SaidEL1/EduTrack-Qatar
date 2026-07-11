import { Test, type TestingModule } from '@nestjs/testing';

import { TenantSecurityPolicyService } from '../../src/modules/identity/application/tenant-security-policy.service.js';
import {
  DEFAULT_TENANT_SECURITY_POLICY,
  TenantSecurityPolicyRepository,
} from '../../src/modules/identity/infrastructure/tenant-security-policy.repository.js';

describe('TenantSecurityPolicyService', () => {
  let service: TenantSecurityPolicyService;
  let repository: jest.Mocked<
    Pick<TenantSecurityPolicyRepository, 'findByTenantId' | 'createDefaults' | 'upsert'>
  >;

  beforeEach(async () => {
    repository = {
      findByTenantId: jest.fn(),
      createDefaults: jest.fn(),
      upsert: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantSecurityPolicyService,
        { provide: TenantSecurityPolicyRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(TenantSecurityPolicyService);
  });

  it('returns defaults when no policy exists', async () => {
    repository.findByTenantId.mockResolvedValue(null);
    const policy = await service.getPolicy('tenant-1');
    expect(policy.mfaRequired).toBe(DEFAULT_TENANT_SECURITY_POLICY.mfaRequired);
  });

  it('updates tenant policy', async () => {
    repository.upsert.mockResolvedValue({
      tenantId: 'tenant-1',
      ...DEFAULT_TENANT_SECURITY_POLICY,
      mfaRequired: true,
    });

    const updated = await service.updatePolicy('tenant-1', { mfaRequired: true });
    expect(updated.mfaRequired).toBe(true);
  });
});
