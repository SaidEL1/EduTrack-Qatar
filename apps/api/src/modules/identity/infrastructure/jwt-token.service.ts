import { SecretsProvider } from '@edutrack/config';
import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

export interface AccessTokenClaims {
  readonly sub: string;
  readonly tenant_id: string;
  readonly email: string;
}

/** RS256 JWT access tokens — TDR-011 */
@Injectable()
export class JwtTokenService {
  private readonly secrets = new SecretsProvider();

  private getPrivateKeyPem(): string {
    return this.secrets.getSecret('JWT_PRIVATE_KEY').replace(/\\n/g, '\n');
  }

  private getPublicKeyPem(): string {
    return this.secrets.getSecret('JWT_PUBLIC_KEY').replace(/\\n/g, '\n');
  }

  signAccessToken(claims: AccessTokenClaims, ttlSeconds: number): string {
    return jwt.sign(
      { tenant_id: claims.tenant_id, email: claims.email },
      this.getPrivateKeyPem(),
      {
        algorithm: 'RS256',
        subject: claims.sub,
        expiresIn: ttlSeconds,
      },
    );
  }

  verifyAccessToken(token: string): AccessTokenClaims {
    const payload: unknown = jwt.verify(token, this.getPublicKeyPem(), {
      algorithms: ['RS256'],
    });

    if (typeof payload !== 'object' || payload === null) {
      throw new Error('Invalid token payload');
    }

    const record = payload as Record<string, unknown>;
    const sub = record['sub'];
    const tenantId = record['tenant_id'];
    const email = record['email'];

    if (
      typeof sub !== 'string' ||
      typeof tenantId !== 'string' ||
      typeof email !== 'string'
    ) {
      throw new Error('Invalid token claims');
    }

    return { sub, tenant_id: tenantId, email };
  }
}
