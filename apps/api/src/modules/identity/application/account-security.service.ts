import { Email, validatePasswordPolicy } from '@edutrack/domain';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import {
  buildPublicLink,
  shouldReturnTokensInResponse,
} from '../../../common/utils/public-link.js';
import { DRIZZLE, type DrizzleDb } from '../../../database/database.module.js';
import { users } from '../../../database/schema/index.js';
import { NotificationService } from '../../notification/application/notification.service.js';
import {
  PasswordHistoryRepository,
  SecurityTokenRepository,
} from '../infrastructure/identity-security.repository.js';
import { PasswordHasherService } from '../infrastructure/password-hasher.service.js';
import { SecurityEventRepository } from '../infrastructure/security-event.repository.js';
import { generateOpaqueToken } from '../infrastructure/token.utils.js';

import { TenantSecurityPolicyService } from './tenant-security-policy.service.js';

const EMAIL_VERIFY_TTL_SECONDS = 86_400;
const PASSWORD_RESET_TTL_SECONDS = 3_600;

@Injectable()
export class AccountSecurityService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly securityTokenRepository: SecurityTokenRepository,
    private readonly passwordHistoryRepository: PasswordHistoryRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly securityEventRepository: SecurityEventRepository,
    private readonly notificationService: NotificationService,
    private readonly tenantSecurityPolicyService: TenantSecurityPolicyService,
  ) {}

  async requestEmailVerification(userId: string): Promise<{ token?: string }> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)));
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email already verified');
    }
    const rawToken = generateOpaqueToken();
    await this.securityTokenRepository.create({
      userId,
      purpose: 'email_verification',
      rawToken,
      expiresAt: new Date(Date.now() + EMAIL_VERIFY_TTL_SECONDS * 1000),
    });

    await this.notificationService.queueEmail({
      templateKey: 'email_verification',
      recipientEmail: user.email,
      variables: {
        link: buildPublicLink('/identity/account/verify-email/confirm', rawToken),
      },
      metadata: { userId },
    });

    return shouldReturnTokensInResponse() ? { token: rawToken } : {};
  }

  async confirmEmailVerification(rawToken: string): Promise<void> {
    const token = await this.securityTokenRepository.consume(
      rawToken,
      'email_verification',
    );
    if (!token) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
    await this.db
      .update(users)
      .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, token.userId));
  }

  async requestPasswordReset(email: string): Promise<{ token?: string }> {
    const emailResult = Email.create(email);
    if (!emailResult.ok) {
      return {};
    }
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, emailResult.value.value), isNull(users.deletedAt)));
    if (!user) {
      return {};
    }
    const rawToken = generateOpaqueToken();
    await this.securityTokenRepository.create({
      userId: user.id,
      purpose: 'password_reset',
      rawToken,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_SECONDS * 1000),
    });
    await this.securityEventRepository.record({
      userId: user.id,
      eventType: 'account.password_reset.requested',
      severity: 'info',
    });

    await this.notificationService.queueEmail({
      templateKey: 'password_reset',
      recipientEmail: user.email,
      variables: {
        link: buildPublicLink('/identity/account/password-reset/confirm', rawToken),
      },
      metadata: { userId: user.id },
    });

    return shouldReturnTokensInResponse() ? { token: rawToken } : {};
  }

  async confirmPasswordReset(rawToken: string, newPassword: string): Promise<void> {
    const policy = validatePasswordPolicy(newPassword);
    if (!policy.ok) {
      throw new BadRequestException(policy.error.message);
    }
    const token = await this.securityTokenRepository.consume(
      rawToken,
      'password_reset',
    );
    if (!token) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
    await this.changePassword(token.userId, newPassword);
    await this.securityEventRepository.record({
      userId: token.userId,
      eventType: 'account.password_reset.completed',
      severity: 'info',
    });
  }

  async changePassword(
    userId: string,
    newPassword: string,
    tenantId?: string,
  ): Promise<void> {
    const policy = validatePasswordPolicy(newPassword);
    if (!policy.ok) {
      throw new BadRequestException(policy.error.message);
    }
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)));
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (tenantId) {
      const tenantPolicy = await this.tenantSecurityPolicyService.getPolicy(tenantId);
      if (newPassword.length < tenantPolicy.passwordMinLength) {
        throw new BadRequestException(
          `Password must be at least ${String(tenantPolicy.passwordMinLength)} characters`,
        );
      }
    }

    const historyHashes = await this.passwordHistoryRepository.listHashes(userId);
    const allHashes = [user.passwordHash, ...historyHashes];
    for (const hash of allHashes) {
      if (await this.passwordHasher.verify(hash, newPassword)) {
        throw new BadRequestException('Password was used recently');
      }
    }

    const expiryDays = tenantId
      ? (await this.tenantSecurityPolicyService.getPolicy(tenantId)).passwordExpiryDays
      : 90;

    const passwordHash = await this.passwordHasher.hash(newPassword);
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
    await this.passwordHistoryRepository.add(userId, user.passwordHash);
    await this.db
      .update(users)
      .set({
        passwordHash,
        passwordChangedAt: new Date(),
        passwordExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  assertPasswordNotExpired(user: { passwordExpiresAt: Date | null }): void {
    if (user.passwordExpiresAt && user.passwordExpiresAt <= new Date()) {
      throw new UnauthorizedException('Password has expired — reset required');
    }
  }
}
