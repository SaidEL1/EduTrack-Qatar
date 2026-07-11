import type { UserStatus } from './user-status.js';

export const MEMBERSHIP_STATUSES = [
  'active',
  'inactive',
  'invited',
  'removed',
] as const;

export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export interface OrganizationMembershipProps {
  readonly id: string;
  readonly tenantId: string;
  readonly userId: string;
  readonly status: MembershipStatus;
  readonly joinedAt: Date;
}

/** Links a user to a tenant organization — FR-SET-003 / NFR-SEC-006 */
export class OrganizationMembership {
  constructor(private readonly props: OrganizationMembershipProps) {}

  get id(): string {
    return this.props.id;
  }

  get tenantId(): string {
    return this.props.tenantId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get status(): MembershipStatus {
    return this.props.status;
  }

  isActive(): boolean {
    return this.props.status === 'active';
  }
}

export function membershipAllowsLogin(
  membershipStatus: MembershipStatus,
  userStatus: UserStatus,
): boolean {
  return membershipStatus === 'active' && userStatus === 'active';
}
