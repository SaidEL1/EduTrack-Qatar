import { EduTrackError, isEduTrackError } from '@edutrack/shared';
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorBody {
  readonly statusCode: number;
  readonly code: string;
  readonly message: string;
  readonly correlationId?: string;
  readonly timestamp: string;
  readonly path: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = request.headers['x-correlation-id'] as string | undefined;
    const timestamp = new Date().toISOString();
    const path = request.url;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL';
    let message = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && 'message' in body) {
        const msg = (body as { message?: string | string[] }).message;
        message = Array.isArray(msg) ? msg.join(', ') : (msg ?? message);
      }
      code = `HTTP_${String(statusCode)}`;
    } else if (isEduTrackError(exception)) {
      statusCode = this.mapEduTrackErrorStatus(exception.code);
      code = exception.code;
      message = exception.message;
    }

    this.logger.error(
      { correlationId, path, code, statusCode, err: exception },
      message,
    );

    const body: ErrorBody = {
      statusCode,
      code,
      message,
      ...(correlationId ? { correlationId } : {}),
      timestamp,
      path,
    };

    response.status(statusCode).json(body);
  }

  private mapEduTrackErrorStatus(code: EduTrackError['code']): number {
    switch (code) {
      case 'VALIDATION_FAILED':
        return HttpStatus.BAD_REQUEST;
      case 'NOT_FOUND':
        return HttpStatus.NOT_FOUND;
      case 'UNAUTHORIZED':
        return HttpStatus.UNAUTHORIZED;
      case 'FORBIDDEN':
        return HttpStatus.FORBIDDEN;
      case 'CONFLICT':
        return HttpStatus.CONFLICT;
      case 'CONFIGURATION':
        return HttpStatus.INTERNAL_SERVER_ERROR;
      case 'EXTERNAL_SERVICE':
        return HttpStatus.BAD_GATEWAY;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
