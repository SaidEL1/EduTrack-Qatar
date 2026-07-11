import type { CorrelationId, TenantId } from '../types/branded.js';

export type EduTrackErrorCode =
  | 'VALIDATION_FAILED'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'INTERNAL'
  | 'CONFIGURATION'
  | 'EXTERNAL_SERVICE';

export interface EduTrackErrorOptions {
  readonly code: EduTrackErrorCode;
  readonly message: string;
  readonly cause?: unknown;
  readonly correlationId?: CorrelationId;
  readonly tenantId?: TenantId;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Base application error with structured fields for logging and API mapping.
 * @see NFR-LOG-001 — structured error context
 */
export class EduTrackError extends Error {
  readonly code: EduTrackErrorCode;
  override readonly cause?: unknown;
  readonly correlationId?: CorrelationId;
  readonly tenantId?: TenantId;
  readonly metadata?: Readonly<Record<string, unknown>>;

  constructor(options: EduTrackErrorOptions) {
    super(options.message);
    this.name = 'EduTrackError';
    this.code = options.code;
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
    if (options.correlationId !== undefined) {
      this.correlationId = options.correlationId;
    }
    if (options.tenantId !== undefined) {
      this.tenantId = options.tenantId;
    }
    if (options.metadata !== undefined) {
      this.metadata = options.metadata;
    }
    Error.captureStackTrace(this, EduTrackError);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      correlationId: this.correlationId,
      tenantId: this.tenantId,
      metadata: this.metadata,
    };
  }
}

export function isEduTrackError(error: unknown): error is EduTrackError {
  return error instanceof EduTrackError;
}
