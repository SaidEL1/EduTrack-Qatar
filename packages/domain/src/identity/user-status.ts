/** User lifecycle states — FR-SET-003 / BC-IDENTITY */
export const USER_STATUSES = [
  'active',
  'inactive',
  'disabled',
  'locked',
  'pending',
] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export function isUserStatus(value: string): value is UserStatus {
  return (USER_STATUSES as readonly string[]).includes(value);
}

export function canAuthenticate(status: UserStatus): boolean {
  return status === 'active';
}
