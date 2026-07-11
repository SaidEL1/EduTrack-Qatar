export { EntityId, type EntityIdProps } from './value-objects/entity-id.js';
export { Email } from './value-objects/email.js';
export { DomainError } from './errors/domain-error.js';
export { ValueObject } from './base/value-object.js';
export { AggregateRoot } from './base/aggregate-root.js';
export {
  USER_STATUSES,
  type UserStatus,
  isUserStatus,
  canAuthenticate,
} from './identity/user-status.js';
export { validatePasswordPolicy } from './identity/password-policy.js';
export { UserAggregate, type UserProfileSnapshot } from './identity/user.aggregate.js';
export {
  OrganizationMembership,
  MEMBERSHIP_STATUSES,
  type MembershipStatus,
  membershipAllowsLogin,
} from './identity/organization-membership.js';
