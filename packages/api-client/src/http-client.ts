import type { CorrelationId, TenantId } from '@edutrack/shared';

import { ApiClientError } from './errors/api-client-error.js';

export interface HttpClientOptions {
  readonly baseUrl: string;
  readonly defaultHeaders?: Readonly<Record<string, string>>;
  readonly fetchImpl?: typeof fetch;
}

export interface HttpRequestOptions {
  readonly path: string;
  readonly method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: unknown;
  readonly correlationId?: CorrelationId;
  readonly tenantId?: TenantId;
}

/**
 * Typed HTTP client foundation for portal and mobile apps.
 * Endpoints are added per sprint as API contracts stabilize.
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Readonly<Record<string, string>>;
  private readonly fetchImpl: typeof fetch;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.defaultHeaders = options.defaultHeaders ?? {};
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async request<T>(options: HttpRequestOptions): Promise<T> {
    const url = `${this.baseUrl}${options.path}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...this.defaultHeaders,
      ...options.headers,
    };

    if (options.correlationId) {
      headers['X-Correlation-Id'] = options.correlationId;
    }
    if (options.tenantId) {
      headers['X-Tenant-Id'] = options.tenantId;
    }

    const init: RequestInit = {
      method: options.method ?? 'GET',
      headers,
    };

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(options.body);
    }

    const response = await this.fetchImpl(url, init);

    if (!response.ok) {
      throw new ApiClientError(
        response.status,
        `HTTP ${String(response.status)} for ${url}`,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}
