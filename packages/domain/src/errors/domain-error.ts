import { EduTrackError } from '@edutrack/shared';

/** Domain-layer error — maps to application errors at boundaries */
export class DomainError extends EduTrackError {
  constructor(message: string, metadata?: Readonly<Record<string, unknown>>) {
    super({
      code: 'VALIDATION_FAILED',
      message,
      ...(metadata !== undefined ? { metadata } : {}),
    });
    this.name = 'DomainError';
  }
}
