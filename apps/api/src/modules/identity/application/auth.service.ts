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

import { DRIZZLE, type DrizzleDb } from '../../../database/database.module.js';
import { organizationMembers, users } from '../../../database/schema/index.js';
import { AuditService } from '../../audit/audit.service.js';
import { buildAuditEntry } from '../../platform/platform-audit.helper.js';
import { JwtTokenService } from '../infrastructure/jwt-token.service.js';
import { PasswordHasherService } from '../infrastructure/password-hasher.service.js';
import { RefreshTokenRepository } from '../infrastructure/refresh-token.repository.js';
import {
  generateFamilyId,
  generateOpaqueToken,
} from '../infrastructure/token.utils.js';

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
  ) {}

  async login(input: LoginInput, correlationId?: string): Promise<TokenPair> {
    const emailResult = Email.create(input.email);
    if (!emailResult.ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, emailResult.value.value), isNull(users.deletedAt)));

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'locked' && user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('Account is temporarily locked');
    }

    if (!canAuthenticate(user.status)) {
      throw new ForbiddenException(`Account is ${user.status}`);
    }

    const passwordValid = await this.passwordHasher.verify(
      user.passwordHash,
      input.password,
    );
    if (!passwordValid) {
      await this.recordFailedLogin(user.id, user.failedLoginAttempts);
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

    const tokens = await this.issueTokenPair(
      user.id,
      input.tenantId,
      user.email,
      input.ipAddress,
      input.userAgent,
    );

    await this.auditService.append(
      buildAuditEntry(
        {
          tenantId: input.tenantId,
          actorId: user.id,
          action: 'auth.login.success',
          entityType: 'user',
          entityId: user.id,
          afterState: { email: user.email },
          ...(input.ipAddress !== undefined ? { ipAddress: input.ipAddress } : {}),
        },
        correlationId,
      ),
    );

    this.logger.info({ userId: user.id, tenantId: input.tenantId }, 'User logged in');

    return tokens;
  }

  async refresh(
    rawRefreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenPair> {
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

    const tenantId = stored.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenRepository.revoke(stored.id);

    return this.issueTokenPair(
      user.id,
      tenantId,
      user.email,
      ipAddress,
      userAgent,
      stored.familyId,
    );
  }

  async logout(rawRefreshToken: string, correlationId?: string): Promise<void> {
    const stored = await this.refreshTokenRepository.findValid(rawRefreshToken);
    if (!stored) {
      return;
    }

    await this.refreshTokenRepository.revoke(stored.id);

    if (stored.tenantId) {
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
}
