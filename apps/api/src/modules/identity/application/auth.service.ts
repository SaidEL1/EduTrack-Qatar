import {
  canAuthenticate,
  Email,
  membershipAllowsLogin,
  validatePasswordPolicy,
} from '@edutrack/domain';
import { createLogger } from '@edutrack/logging';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import { definedFields } from '../../../common/utils/defined-fields.js';
import { DRIZZLE, type DrizzleDb } from '../../../database/database.module.js';
import { organizationMembers, users } from '../../../database/schema/index.js';
import { AuditService } from '../../audit/audit.service.js';
import { buildAuditEntry } from '../../platform/platform-audit.helper.js';
import { JwtTokenService } from '../infrastructure/jwt-token.service.js';
import { PasswordHasherService } from '../infrastructure/password-hasher.service.js';
import { RefreshTokenRepository } from '../infrastructure/refresh-token.repository.js';
import {
  LoginEventRepository,
  SecurityEventRepository,
} from '../infrastructure/security-event.repository.js';
import {
  generateFamilyId,
  generateOpaqueToken,
} from '../infrastructure/token.utils.js';

import { AccountSecurityService } from './account-security.service.js';
import { MfaService } from './mfa.service.js';
import { SessionManagementService } from './session-management.service.js';
import { TenantSecurityPolicyService } from './tenant-security-policy.service.js';

const ACCESS_TOKEN_TTL_SECONDS = 900;
const REFRESH_TOKEN_TTL_SECONDS = 604_800;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export interface LoginInput {
  readonly email: string;
  readonly password: string;
  readonly tenantId: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

export interface TokenPair {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
  readonly tokenType: 'Bearer';
}

export interface MfaRequiredResponse {
  readonly mfaRequired: true;
  readonly challengeToken: string;
  readonly expiresIn: number;
}

export type LoginResult = TokenPair | MfaRequiredResponse;

/** Authentication orchestration — TDR-011 / NFR-LOG-001 */
@Injectable()
export class AuthService {
  private readonly logger = createLogger({
    prettyPrint: process.env['NODE_ENV'] === 'development',
    baseContext: {
      service: process.env['SERVICE_NAME'] ?? 'edutrack-api',
      environment: process.env['NODE_ENV'] ?? 'test',
      module: 'AuthService',
    },
  });

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly passwordHasher: PasswordHasherService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly auditService: AuditService,
    private readonly mfaService: MfaService,
    private readonly accountSecurityService: AccountSecurityService,
    private readonly sessionManagementService: SessionManagementService,
    private readonly loginEventRepository: LoginEventRepository,
    private readonly securityEventRepository: SecurityEventRepository,
    private readonly tenantSecurityPolicyService: TenantSecurityPolicyService,
  ) {}

  async login(input: LoginInput, correlationId?: string): Promise<LoginResult> {
    const emailResult = Email.create(input.email);
    if (!emailResult.ok) {
      await this.recordLoginEvent({
        email: input.email,
        outcome: 'failure',
        tenantId: input.tenantId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, emailResult.value.value), isNull(users.deletedAt)));

    if (!user) {
      await this.recordLoginEvent({
        email: emailResult.value.value,
        outcome: 'failure',
        tenantId: input.tenantId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'locked' && user.lockedUntil && user.lockedUntil > new Date()) {
      await this.recordLoginEvent({
        tenantId: input.tenantId,
        userId: user.id,
        email: user.email,
        outcome: 'locked',
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });
      throw new ForbiddenException('Account is temporarily locked');
    }

    if (!canAuthenticate(user.status)) {
      throw new ForbiddenException(`Account is ${user.status}`);
    }

    this.accountSecurityService.assertPasswordNotExpired(user);

    const passwordValid = await this.passwordHasher.verify(
      user.passwordHash,
      input.password,
    );
    if (!passwordValid) {
      await this.recordFailedLogin(user.id, user.failedLoginAttempts);
      await this.recordLoginEvent({
        tenantId: input.tenantId,
        userId: user.id,
        email: user.email,
        outcome: 'failure',
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const [membership] = await this.db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.tenantId, input.tenantId),
          eq(organizationMembers.userId, user.id),
          isNull(organizationMembers.deletedAt),
        ),
      );

    if (!membership || !membershipAllowsLogin(membership.status, user.status)) {
      throw new ForbiddenException('No active membership for this organization');
    }

    await this.db
      .update(users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    const tenantPolicy = await this.tenantSecurityPolicyService.getPolicy(
      input.tenantId,
    );
    if (tenantPolicy.mfaRequired && !user.mfaEnabled) {
      throw new ForbiddenException('MFA must be enabled for this organization');
    }

    if (user.mfaEnabled) {
      const challengeToken = await this.mfaService.createLoginChallenge({
        userId: user.id,
        tenantId: input.tenantId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });
      await this.recordLoginEvent({
        tenantId: input.tenantId,
        userId: user.id,
        email: user.email,
        outcome: 'mfa_required',
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });
      return {
        mfaRequired: true,
        challengeToken,
        expiresIn: 300,
      };
    }

    const tokens = await this.completeLogin(
      user.id,
      input.tenantId,
      user.email,
      input.ipAddress,
      input.userAgent,
      correlationId,
    );

    this.logger.info({ userId: user.id, tenantId: input.tenantId }, 'User logged in');
    return tokens;
  }

  async verifyMfaAndLogin(
    challengeToken: string,
    code: string,
    ipAddress?: string,
    userAgent?: string,
    correlationId?: string,
  ): Promise<TokenPair> {
    const { userId, tenantId } = await this.mfaService.verifyLoginChallenge(
      challengeToken,
      code,
    );
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)));
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.recordLoginEvent({
      tenantId,
      userId,
      email: user.email,
      outcome: 'mfa_success',
      ipAddress,
      userAgent,
    });
    return this.completeLogin(
      userId,
      tenantId,
      user.email,
      ipAddress,
      userAgent,
      correlationId,
    );
  }

  async refresh(
    rawRefreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenPair> {
    const anyToken = await this.refreshTokenRepository.findByHash(rawRefreshToken);
    if (!anyToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (anyToken.revokedAt) {
      await this.refreshTokenRepository.revokeFamily(
        anyToken.familyId,
        anyToken.userId,
      );
      await this.securityEventRepository.record({
        userId: anyToken.userId,
        eventType: 'auth.refresh_token.reuse',
        severity: 'critical',
        metadata: { familyId: anyToken.familyId },
        ...definedFields({
          tenantId: anyToken.tenantId ?? undefined,
          ipAddress,
        }),
      });
      await this.recordLoginEvent({
        userId: anyToken.userId,
        email: '',
        outcome: 'token_reuse',
        ipAddress,
        userAgent,
        tenantId: anyToken.tenantId ?? undefined,
      });
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    const stored = await this.refreshTokenRepository.findValid(rawRefreshToken);
    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, stored.userId), isNull(users.deletedAt)));

    if (!user || !canAuthenticate(user.status)) {
      await this.refreshTokenRepository.revokeFamily(stored.familyId, stored.userId);
      throw new UnauthorizedException('Invalid refresh token');
    }

    this.accountSecurityService.assertPasswordNotExpired(user);

    const tenantId = stored.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenRepository.revoke(stored.id);

    const tokens = await this.issueTokenPair(
      user.id,
      tenantId,
      user.email,
      ipAddress,
      userAgent,
      stored.familyId,
    );

    await this.trackUserSession({
      userId: user.id,
      tenantId,
      familyId: stored.familyId,
      ...definedFields({ ipAddress, userAgent }),
    });

    return tokens;
  }

  async logout(rawRefreshToken: string, correlationId?: string): Promise<void> {
    const stored = await this.refreshTokenRepository.findValid(rawRefreshToken);
    if (!stored) {
      return;
    }

    await this.refreshTokenRepository.revoke(stored.id);

    if (stored.tenantId) {
      await this.sessionManagementService.revokeByFamilyId(stored.familyId);
      await this.auditService.append(
        buildAuditEntry(
          {
            tenantId: stored.tenantId,
            actorId: stored.userId,
            action: 'auth.logout',
            entityType: 'user',
            entityId: stored.userId,
          },
          correlationId,
        ),
      );
    }
  }

  validatePassword(password: string): void {
    const result = validatePasswordPolicy(password);
    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }
  }

  private async completeLogin(
    userId: string,
    tenantId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string,
    correlationId?: string,
  ): Promise<TokenPair> {
    const tokens = await this.issueTokenPair(
      userId,
      tenantId,
      email,
      ipAddress,
      userAgent,
    );

    await this.recordLoginEvent({
      tenantId,
      userId,
      email,
      outcome: 'success',
      ...definedFields({ ipAddress, userAgent }),
    });

    await this.auditService.append(
      buildAuditEntry(
        {
          tenantId,
          actorId: userId,
          action: 'auth.login.success',
          entityType: 'user',
          entityId: userId,
          afterState: { email },
          ...(ipAddress !== undefined ? { ipAddress } : {}),
        },
        correlationId,
      ),
    );

    return tokens;
  }

  private async issueTokenPair(
    userId: string,
    tenantId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string,
    existingFamilyId?: string,
  ): Promise<TokenPair> {
    const accessToken = this.jwtTokenService.signAccessToken(
      { sub: userId, tenant_id: tenantId, email },
      ACCESS_TOKEN_TTL_SECONDS,
    );

    const rawRefreshToken = generateOpaqueToken();
    const familyId = existingFamilyId ?? generateFamilyId();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

    await this.refreshTokenRepository.store({
      userId,
      tenantId,
      rawToken: rawRefreshToken,
      familyId,
      expiresAt,
      ...(ipAddress !== undefined ? { ipAddress } : {}),
      ...(userAgent !== undefined ? { userAgent } : {}),
    });

    await this.trackUserSession({
      userId,
      tenantId,
      familyId,
      ...definedFields({ ipAddress, userAgent }),
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      tokenType: 'Bearer',
    };
  }

  private async recordFailedLogin(
    userId: string,
    currentAttempts: number,
  ): Promise<void> {
    const attempts = currentAttempts + 1;
    const updates: {
      failedLoginAttempts: number;
      updatedAt: Date;
      status?: 'locked';
      lockedUntil?: Date;
    } = {
      failedLoginAttempts: attempts,
      updatedAt: new Date(),
    };

    if (attempts >= MAX_FAILED_ATTEMPTS) {
      updates.status = 'locked';
      updates.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      this.logger.warn(
        { userId, attempts },
        'Account locked due to failed login attempts',
      );
    }

    await this.db.update(users).set(updates).where(eq(users.id, userId));
  }

  private async recordLoginEvent(input: {
    readonly email: string;
    readonly outcome:
      | 'locked'
      | 'success'
      | 'failure'
      | 'mfa_required'
      | 'mfa_success'
      | 'mfa_failure'
      | 'token_reuse';
    readonly tenantId?: string | undefined;
    readonly userId?: string | undefined;
    readonly ipAddress?: string | undefined;
    readonly userAgent?: string | undefined;
  }): Promise<void> {
    await this.loginEventRepository.record({
      email: input.email,
      outcome: input.outcome,
      ...definedFields({
        tenantId: input.tenantId,
        userId: input.userId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      }),
    });
  }

  private trackUserSession(input: {
    readonly userId: string;
    readonly tenantId: string;
    readonly familyId: string;
    readonly ipAddress?: string | undefined;
    readonly userAgent?: string | undefined;
  }): Promise<void> {
    return this.sessionManagementService.trackSession({
      userId: input.userId,
      tenantId: input.tenantId,
      familyId: input.familyId,
      ...definedFields({
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      }),
    });
  }
}
