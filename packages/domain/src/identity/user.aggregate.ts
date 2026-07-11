import { AggregateRoot } from '../base/aggregate-root.js';
import type { UserStatus } from '../identity/user-status.js';
import type { Email } from '../value-objects/email.js';
import { type EntityId } from '../value-objects/entity-id.js';

export interface UserProfileSnapshot {
  readonly firstName: string;
  readonly lastName: string;
  readonly displayName?: string;
  readonly locale?: string;
  readonly timezone?: string;
}

export interface UserAggregateProps {
  readonly id: EntityId;
  readonly email: Email;
  readonly status: UserStatus;
  readonly profile?: UserProfileSnapshot;
}

/** BC-IDENTITY User aggregate root — FR-SET-003 */
export class UserAggregate extends AggregateRoot {
  private readonly email: Email;
  private status: UserStatus;
  private profile?: UserProfileSnapshot;

  private constructor(props: UserAggregateProps) {
    super(props.id);
    this.email = props.email;
    this.status = props.status;
    if (props.profile !== undefined) {
      this.profile = props.profile;
    }
  }

  static reconstitute(props: UserAggregateProps): UserAggregate {
    return new UserAggregate(props);
  }

  get emailAddress(): string {
    return this.email.value;
  }

  get userStatus(): UserStatus {
    return this.status;
  }

  get profileSnapshot(): UserProfileSnapshot | undefined {
    return this.profile;
  }

  deactivate(): void {
    this.status = 'inactive';
  }

  reactivate(): void {
    this.status = 'active';
  }

  disable(): void {
    this.status = 'disabled';
  }

  lock(): void {
    this.status = 'locked';
  }
}
