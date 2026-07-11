import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';

authenticator.options = { window: 1 };

export interface TotpEnrollment {
  readonly secret: string;
  readonly otpauthUrl: string;
}

/** TOTP generation and verification — RFC 6238 / NFR-SEC-005 */
@Injectable()
export class TotpService {
  generateEnrollment(accountName: string, issuer = 'EduTrack'): TotpEnrollment {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(accountName, issuer, secret);
    return { secret, otpauthUrl };
  }

  verify(token: string, secret: string): boolean {
    return authenticator.verify({ token, secret });
  }
}
