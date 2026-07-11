import { Injectable, NotFoundException } from '@nestjs/common';

import { definedFields } from '../../../common/utils/defined-fields.js';
import { UserSessionRepository } from '../infrastructure/identity-security.repository.js';
import { RefreshTokenRepository } from '../infrastructure/refresh-token.repository.js';

import { TenantSecurityPolicyService } from './tenant-security-policy.service.js';

@Injectable()
export class SessionManagementService {
  constructor(
    private readonly userSessionRepository: UserSessionRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tenantSecurityPolicyService: TenantSecurityPolicyService,
  ) {}

  async trackSession(input: {
    readonly userId: string;
    readonly tenantId: string;
    readonly familyId: string;
    readonly ipAddress?: string;
    readonly userAgent?: string;
  }): Promise<void> {
    const deviceLabel = deriveDeviceLabel(input.userAgent);
    await this.userSessionRepository.upsert({
      userId: input.userId,
      tenantId: input.tenantId,
      familyId: input.familyId,
      ...definedFields({
        deviceLabel,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      }),
    });

    await this.enforceSessionLimit(input.userId, input.tenantId);
  }

  private async enforceSessionLimit(userId: string, tenantId: string): Promise<void> {
    const policy = await this.tenantSecurityPolicyService.getPolicy(tenantId);
    const sessions = await this.userSessionRepository.listActive(userId, tenantId);
    if (sessions.length <= policy.maxActiveSessions) {
      return;
    }
    const excess = sessions.slice(policy.maxActiveSessions);
    for (const session of excess) {
      await this.revokeSession(userId, tenantId, session.id);
    }
  }

  async listSessions(userId: string, tenantId: string) {
    return this.userSessionRepository.listActive(userId, tenantId);
  }

  async revokeSession(
    userId: string,
    tenantId: string,
    sessionId: string,
  ): Promise<void> {
    const familyId = await this.userSessionRepository.revoke(sessionId, userId);
    if (!familyId) {
      throw new NotFoundException('Session not found');
    }
    await this.refreshTokenRepository.revokeFamily(familyId, userId);
  }

  async revokeByFamilyId(familyId: string): Promise<void> {
    await this.userSessionRepository.revokeByFamilyId(familyId);
  }

  async revokeAllSessions(userId: string, tenantId: string): Promise<number> {
    const familyIds = await this.userSessionRepository.revokeAll(userId, tenantId);
    for (const familyId of familyIds) {
      await this.refreshTokenRepository.revokeFamily(familyId, userId);
    }
    await this.refreshTokenRepository.revokeAllForUser(userId, tenantId);
    return familyIds.length;
  }
}

function deriveDeviceLabel(userAgent?: string): string | undefined {
  if (!userAgent) {
    return undefined;
  }
  if (userAgent.includes('Mobile')) {
    return 'Mobile device';
  }
  if (userAgent.includes('Windows')) {
    return 'Windows';
  }
  if (userAgent.includes('Mac')) {
    return 'macOS';
  }
  return 'Browser';
}
