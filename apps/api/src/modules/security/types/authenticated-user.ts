export interface AuthenticatedUser {
  readonly userId: string;
  readonly tenantId: string;
  readonly email: string;
}
