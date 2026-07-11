import { Injectable } from '@nestjs/common';

import {
  DEFAULT_TENANT_SECURITY_POLICY,
  TenantSecurityPolicyRepository,
  type TenantSecurityPolicyRecord,
} from '../infrastructure/tenant-security-policy.repository.js';

@Injectable()
export class TenantSecurityPolicyService {
  constructor(private readonly repository: TenantSecurityPolicyRepository) {}

  async getPolicy(tenantId: string): Promise<TenantSecurityPolicyRecord> {
    const policy = await this.repository.findByTenantId(tenantId);
    if (policy) {
      return policy;
    }
    return { tenantId, ...DEFAULT_TENANT_SECURITY_POLICY };
  }

  async ensureDefaults(tenantId: string): Promise<TenantSecurityPolicyRecord> {
    const existing = await this.repository.findByTenantId(tenantId);
    if (existing) {
      return existing;
    }
    return this.repository.createDefaults(tenantId);
  }

  async updatePolicy(
    tenantId: string,
    input: Partial<Omit<TenantSecurityPolicyRecord, 'tenantId'>>,
  ): Promise<TenantSecurityPolicyRecord> {
    return this.repository.upsert(tenantId, input);
  }

  async isMfaRequired(tenantId: string): Promise<boolean> {
    const policy = await this.getPolicy(tenantId);
    return policy.mfaRequired;
  }
}
