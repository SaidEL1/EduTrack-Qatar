import { createCorrelationId, parseCorrelationId } from '@edutrack/shared';
import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const incoming = request.headers[CORRELATION_ID_HEADER];
    const headerValue = Array.isArray(incoming) ? incoming[0] : incoming;
    const correlationId = parseCorrelationId(headerValue) ?? createCorrelationId();

    request.headers[CORRELATION_ID_HEADER] = correlationId;
    response.setHeader(CORRELATION_ID_HEADER, correlationId);
    next();
  }
}
