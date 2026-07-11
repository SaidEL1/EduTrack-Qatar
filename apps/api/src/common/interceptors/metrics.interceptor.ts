import { recordHttpRequestDuration } from '@edutrack/observability';
import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { type Observable, tap } from 'rxjs';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const started = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        const route = request.route as { path?: string } | undefined;
        const routePath = route?.path ?? request.path;

        recordHttpRequestDuration(
          request.method,
          routePath,
          response.statusCode,
          Date.now() - started,
        );
      }),
    );
  }
}
