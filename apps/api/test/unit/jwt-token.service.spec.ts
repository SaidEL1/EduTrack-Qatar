import { JwtTokenService } from '../../src/modules/identity/infrastructure/jwt-token.service.js';
import { ensureTestJwtKeys } from '../helpers/jwt-test-keys.js';

describe('JwtTokenService', () => {
  beforeAll(() => {
    ensureTestJwtKeys();
  });

  it('signs and verifies RS256 access tokens', () => {
    const service = new JwtTokenService();

    const token = service.signAccessToken(
      {
        sub: 'user-123',
        tenant_id: 'tenant-456',
        email: 'admin@school.qa',
      },
      300,
    );

    const claims = service.verifyAccessToken(token);
    expect(claims.sub).toBe('user-123');
    expect(claims.tenant_id).toBe('tenant-456');
    expect(claims.email).toBe('admin@school.qa');
  });
});
