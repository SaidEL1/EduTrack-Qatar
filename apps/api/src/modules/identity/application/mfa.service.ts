import { createHash, randomBytes } from 'node:crypto';

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import { definedFields } from '../../../common/utils/defined-fields.js';
import { timingSafeCompare } from '../../../common/utils/timing-safe-compare.js';
import { DRIZZLE, type DrizzleDb } from '../../../database/database.module.js';
import { users } from '../../../database/schema/index.js';
import { UserMfaRepository } from '../infrastructure/identity-security.repository.js';
import { SecretEncryptionService } from '../infrastructure/secret-encryption.service.js';
import {
  MfaLoginChallengeRepository,
  SecurityEventRepository,
} from '../infrastructure/security-event.repository.js';
import { generateOpaqueToken } from '../infrastructure/token.utils.js';
import { TotpService } from '../infrastructure/totp.service.js';

const MFA_CHALLENGE_TTL_SECONDS = 300;
const BACKUP_CODE_COUNT = 10;

export interface MfaEnrollmentResult {
  readonly secret: string;
  readonly otpauthUrl: string;
}

export interface MfaConfirmResult {
  readonly backupCodes: string[];
}

@Injectable()
export class MfaService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly userMfaRepository: UserMfaRepository,
    private readonly secretEncryption: SecretEncryptionService,
    private readonly totpService: TotpService,
    private readonly mfaChallengeRepository: MfaLoginChallengeRepository,
    private readonly securityEventRepository: SecurityEventRepository,
  ) {}

  async startEnrollment(userId: string, email: string): Promise<MfaEnrollmentResult> {
    const enrollment = this.totpService.generateEnrollment(email);
    await this.userMfaRepository.upsertPending({
      userId,
      secretEncrypted: this.secretEncryption.encrypt(enrollment.secret),
    });
    return enrollment;
  }

  async confirmEnrollment(userId: string, code: string): Promise<MfaConfirmResult> {
    const record = await this.userMfaRepository.findByUserId(userId);
    if (!record) {
      throw new BadRequestException('MFA enrollment not started');
    }
    const secret = this.secretEncryption.decrypt(record.secretEncrypted);
    if (!this.totpService.verify(code, secret)) {
      throw new UnauthorizedException('Invalid MFA code');
    }
    const backupCodes = this.generateBackupCodes();
    const backupCodeHashes = backupCodes.map((c) => hashBackupCode(c));
    await this.userMfaRepository.enable(userId, backupCodeHashes);
    await this.db
      .update(users)
      .set({ mfaEnabled: true, updatedAt: new Date() })
      .where(eq(users.id, userId));
    return { backupCodes };
  }

  async disable(userId: string, code: string): Promise<void> {
    await this.verifyCode(userId, code);
    await this.userMfaRepository.remove(userId);
    await this.db
      .update(users)
      .set({ mfaEnabled: false, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async regenerateBackupCodes(userId: string, code: string): Promise<string[]> {
    await this.verifyCode(userId, code);
    const backupCodes = this.generateBackupCodes();
    await this.userMfaRepository.updateBackupCodes(
      userId,
      backupCodes.map((c) => hashBackupCode(c)),
    );
    return backupCodes;
  }

  async isMfaEnabled(userId: string): Promise<boolean> {
    const [user] = await this.db
      .select({ mfaEnabled: users.mfaEnabled })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)));
    return user?.mfaEnabled ?? false;
  }

  async createLoginChallenge(input: {
    readonly userId: string;
    readonly tenantId: string;
    readonly ipAddress?: string | undefined;
    readonly userAgent?: string | undefined;
  }): Promise<string> {
    const rawToken = generateOpaqueToken();
    await this.mfaChallengeRepository.create({
      userId: input.userId,
      tenantId: input.tenantId,
      rawToken,
      expiresAt: new Date(Date.now() + MFA_CHALLENGE_TTL_SECONDS * 1000),
      ...definedFields({
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      }),
    });
    return rawToken;
  }

  async verifyLoginChallenge(
    challengeToken: string,
    code: string,
  ): Promise<{ userId: string; tenantId: string }> {
    const challenge = await this.mfaChallengeRepository.consume(challengeToken);
    if (!challenge) {
      throw new UnauthorizedException('Invalid or expired MFA challenge');
    }
    const verified = await this.verifyCode(challenge.userId, code, {
      allowBackup: true,
      tenantId: challenge.tenantId,
      ...(challenge.ipAddress != null ? { ipAddress: challenge.ipAddress } : {}),
    });
    if (!verified) {
      await this.securityEventRepository.record({
        tenantId: challenge.tenantId,
        userId: challenge.userId,
        eventType: 'mfa.login.failure',
        severity: 'warning',
        ...(challenge.ipAddress != null ? { ipAddress: challenge.ipAddress } : {}),
      });
      throw new UnauthorizedException('Invalid MFA code');
    }
    return { userId: challenge.userId, tenantId: challenge.tenantId };
  }

  async verifyCode(
    userId: string,
    code: string,
    options?: {
      readonly allowBackup?: boolean;
      readonly tenantId?: string;
      readonly ipAddress?: string;
    },
  ): Promise<boolean> {
    const record = await this.userMfaRepository.findByUserId(userId);
    if (!record?.enabledAt) {
      throw new BadRequestException('MFA is not enabled');
    }
    const secret = this.secretEncryption.decrypt(record.secretEncrypted);
    if (this.totpService.verify(code, secret)) {
      return true;
    }
    if (options?.allowBackup && record.backupCodeHashes) {
      return this.consumeBackupCode(userId, code, record.backupCodeHashes);
    }
    return false;
  }

  private async consumeBackupCode(
    userId: string,
    code: string,
    hashes: string[],
  ): Promise<boolean> {
    const normalized = code.replace(/\s/g, '').toUpperCase();
    const hash = hashBackupCode(normalized);
    const index = hashes.findIndex((h) => timingSafeCompare(h, hash));
    if (index === -1) {
      return false;
    }
    const remaining = hashes.filter((_, i) => i !== index);
    await this.userMfaRepository.updateBackupCodes(userId, remaining);
    await this.securityEventRepository.record({
      userId,
      eventType: 'mfa.backup_code.used',
      severity: 'warning',
    });
    return true;
  }

  private generateBackupCodes(): string[] {
    return Array.from({ length: BACKUP_CODE_COUNT }, () =>
      randomBytes(5).toString('hex').toUpperCase(),
    );
  }
}

function hashBackupCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}
