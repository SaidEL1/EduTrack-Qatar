import { EduTrackError } from '@edutrack/shared';

export class ApiClientError extends EduTrackError {
  readonly status: number;

  constructor(status: number, message: string, cause?: unknown) {
    super({
      code: status >= 500 ? 'EXTERNAL_SERVICE' : 'VALIDATION_FAILED',
      message,
      ...(cause !== undefined ? { cause } : {}),
      metadata: { status },
    });
    this.name = 'ApiClientError';
    this.status = status;
  }
}
