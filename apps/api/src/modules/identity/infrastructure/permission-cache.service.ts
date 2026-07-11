import { createRequire } from 'node:module';

import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

export const PERMISSION_CACHE_TTL_SECONDS = 60;

const require = createRequire(import.meta.url);
const IORedis = require('ioredis') as new (
  url: string,
  options?: { maxRetriesPerRequest?: number; lazyConnect?: boolean },
) => {
  status: string;
  connect(): Promise<void>;
  get(key: string): Promise<string | null>;
  setex(key: string, ttl: number, value: string): Promise<'OK'>;
  del(...keys: string[]): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  quit(): Promise<'OK'>;
};

/** Redis-backed permission cache — TDR-007 / AC-SET-001 */
@Injectable()
export class PermissionCacheService implements OnModuleDestroy, OnModuleInit {
  private readonly redis: InstanceType<typeof IORedis> | undefined;
  private readonly memoryFallback = new Map<
    string,
    { value: string[]; expiresAt: number }
  >();
  private readonly redisRequired = process.env['REDIS_REQUIRED'] === 'true';

  constructor(@Inject('REDIS_URL') redisUrl: string | undefined) {
    if (redisUrl) {
      this.redis = new IORedis(redisUrl, {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
      });
      void this.redis.connect().catch(() => {
        /* fall back to in-memory when Redis unavailable */
      });
    }
  }

  onModuleInit(): void {
    if (this.redisRequired && !this.redis) {
      throw new Error('REDIS_URL is required when REDIS_REQUIRED=true');
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  private cacheKey(tenantId: string, userId: string): string {
    return `perm:${tenantId}:${userId}`;
  }

  async get(tenantId: string, userId: string): Promise<string[] | undefined> {
    const key = this.cacheKey(tenantId, userId);

    if (this.redis?.status === 'ready') {
      const cached = await this.redis.get(key);
      if (cached) {
        return JSON.parse(cached) as string[];
      }
      return undefined;
    }

    const entry = this.memoryFallback.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.value;
    }
    this.memoryFallback.delete(key);
    return undefined;
  }

  async set(tenantId: string, userId: string, permissions: string[]): Promise<void> {
    const key = this.cacheKey(tenantId, userId);

    if (this.redis?.status === 'ready') {
      await this.redis.setex(
        key,
        PERMISSION_CACHE_TTL_SECONDS,
        JSON.stringify(permissions),
      );
      return;
    }

    this.memoryFallback.set(key, {
      value: permissions,
      expiresAt: Date.now() + PERMISSION_CACHE_TTL_SECONDS * 1000,
    });
  }

  async invalidate(tenantId: string, userId: string): Promise<void> {
    const key = this.cacheKey(tenantId, userId);

    if (this.redis?.status === 'ready') {
      await this.redis.del(key);
    }
    this.memoryFallback.delete(key);
  }

  async invalidateTenant(tenantId: string): Promise<void> {
    const pattern = `perm:${tenantId}:*`;

    if (this.redis?.status === 'ready') {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }

    for (const key of this.memoryFallback.keys()) {
      if (key.startsWith(`perm:${tenantId}:`)) {
        this.memoryFallback.delete(key);
      }
    }
  }
}
