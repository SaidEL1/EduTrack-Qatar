import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

/** Argon2id password hashing — TDR-011 / NFR-SEC-004 */
@Injectable()
export class PasswordHasherService {
  async hash(plainPassword: string): Promise<string> {
    return argon2.hash(plainPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  async verify(hash: string, plainPassword: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plainPassword);
    } catch {
      return false;
    }
  }
}
