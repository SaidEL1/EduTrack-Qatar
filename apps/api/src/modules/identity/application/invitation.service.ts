import { Email, validatePasswordPolicy } from '@edutrack/domain';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import { definedFields } from '../../../common/utils/defined-fields.js';
import {
  buildPublicLink,
  shouldReturnTokensInResponse,
} from '../../../common/utils/public-link.js';
import { DRIZZLE, type DrizzleDb } from '../../../database/database.module.js';
import {
  invitations,
  organizationMembers,
  tenants,
  users,
} from '../../../database/schema/index.js';
import { AuditService } from '../../audit/audit.service.js';
import { NotificationService } from '../../notification/application/notification.service.js';
import { buildAuditEntry } from '../../platform/platform-audit.helper.js';
import { InvitationRepository } from '../infrastructure/identity-security.repository.js';
import { RbacRepository } from '../infrastructure/rbac.repository.js';
import { generateOpaqueToken } from '../infrastructure/token.utils.js';

import { UserManagementService } from './user-management.service.js';

const INVITATION_TTL_SECONDS = 604_800;

@Injectable()
export class InvitationService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly invitationRepository: InvitationRepository,
    private readonly userManagementService: UserManagementService,
    private readonly rbacRepository: RbacRepository,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
  ) {}

  async createInvitation(
    input: {
      readonly tenantId: string;
      readonly email: string;
      readonly roleId?: string;
      readonly invitedBy: string;
    },
    correlationId?: string,
  ) {
    const emailResult = Email.create(input.email);
    if (!emailResult.ok) {
      throw new BadRequestException('Invalid email');
    }
    const rawToken = generateOpaqueToken();
    const invitation = await this.invitationRepository.create({
      tenantId: input.tenantId,
      email: emailResult.value.value,
      invitedBy: input.invitedBy,
      rawToken,
      expiresAt: new Date(Date.now() + INVITATION_TTL_SECONDS * 1000),
      ...definedFields({ roleId: input.roleId }),
    });
    await this.auditService.append(
      buildAuditEntry(
        {
          tenantId: input.tenantId,
          actorId: input.invitedBy,
          action: 'identity.invitation.created',
          entityType: 'invitation',
          entityId: invitation?.id ?? '',
          afterState: { email: emailResult.value.value },
        },
        correlationId,
      ),
    );

    const [tenant] = await this.db
      .select({ name: tenants.name })
      .from(tenants)
      .where(eq(tenants.id, input.tenantId));

    await this.notificationService.queueEmail({
      tenantId: input.tenantId,
      templateKey: 'user_invitation',
      recipientEmail: emailResult.value.value,
      variables: {
        link: buildPublicLink('/auth/invitations/accept', rawToken),
        tenantName: tenant?.name ?? 'your organization',
      },
      metadata: { invitationId: invitation?.id ?? '' },
    });

    return {
      invitation,
      ...(shouldReturnTokensInResponse() ? { token: rawToken } : {}),
    };
  }

  async listInvitations(tenantId: string) {
    return this.invitationRepository.listByTenant(tenantId);
  }

  async acceptInvitation(
    input: {
      readonly token: string;
      readonly password: string;
      readonly firstName: string;
      readonly lastName: string;
    },
    correlationId?: string,
  ) {
    const policy = validatePasswordPolicy(input.password);
    if (!policy.ok) {
      throw new BadRequestException(policy.error.message);
    }
    const invitation = await this.invitationRepository.findByToken(input.token);
    if (invitation?.status !== 'pending') {
      throw new UnauthorizedException('Invalid invitation');
    }
    if (invitation.expiresAt <= new Date()) {
      await this.db
        .update(invitations)
        .set({ status: 'expired' })
        .where(eq(invitations.id, invitation.id));
      throw new UnauthorizedException('Invitation expired');
    }

    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, invitation.email), isNull(users.deletedAt)));

    let userId = existingUser?.id;

    if (!existingUser) {
      const created = await this.userManagementService.createUser({
        tenantId: invitation.tenantId,
        email: invitation.email,
        password: input.password,
        firstName: input.firstName,
        lastName: input.lastName,
        ...(invitation.roleId != null ? { roleId: invitation.roleId } : {}),
      });
      userId = created.id;
    } else {
      const [membership] = await this.db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.tenantId, invitation.tenantId),
            eq(organizationMembers.userId, existingUser.id),
            isNull(organizationMembers.deletedAt),
          ),
        );
      if (!membership) {
        await this.db.insert(organizationMembers).values({
          tenantId: invitation.tenantId,
          userId: existingUser.id,
          status: 'active',
          joinedAt: new Date(),
        });
      } else {
        await this.db
          .update(organizationMembers)
          .set({ status: 'active', joinedAt: new Date(), updatedAt: new Date() })
          .where(eq(organizationMembers.id, membership.id));
      }
      if (invitation.roleId) {
        await this.rbacRepository.assignRole(
          invitation.tenantId,
          existingUser.id,
          invitation.roleId,
        );
      }
    }

    if (!userId) {
      throw new NotFoundException('Failed to create user');
    }

    await this.invitationRepository.markAccepted(invitation.id, userId);
    await this.auditService.append(
      buildAuditEntry(
        {
          tenantId: invitation.tenantId,
          actorId: userId,
          action: 'identity.invitation.accepted',
          entityType: 'invitation',
          entityId: invitation.id,
        },
        correlationId,
      ),
    );
    return { userId, tenantId: invitation.tenantId, email: invitation.email };
  }
}
