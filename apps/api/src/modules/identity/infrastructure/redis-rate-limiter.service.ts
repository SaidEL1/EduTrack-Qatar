import { createRequire } from 'node:module';

import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

const require = createRequire(import.meta.url);
const IORedis = require('ioredis') as new (
  url: string,
  options?: { maxRetriesPerRequest?: number; lazyConnect?: boolean },
) => {
  status: string;
  connect(): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  quit(): Promise<'OK'>;
};

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly retryAfterSeconds: number;
}

/** Redis sliding-window rate limiter for auth endpoints — Sprint 2B */
@Injectable()
export class RedisRateLimiterService implements OnModuleDestroy, OnModuleInit {
  private readonly redis: InstanceType<typeof IORedis> | undefined;
  private readonly memoryCounters = new Map<
    string,
    { count: number; resetAt: number }
  >();
  private readonly redisRequired = process.env['REDIS_REQUIRED'] === 'true';

  constructor(@Inject('REDIS_URL') redisUrl: string | undefined) {
    if (redisUrl) {
      this.redis = new IORedis(redisUrl, {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
      });
      void this.redis.connect().catch(() => undefined);
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

  async check(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    if (this.redis?.status === 'ready') {
      return this.checkRedis(key, limit, windowSeconds);
    }
    return this.checkMemory(key, limit, windowSeconds);
  }

  private async checkRedis(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    const redis = this.redis;
    if (!redis) {
      throw new Error('Redis client is not connected');
    }
    const redisKey = `ratelimit:${key}`;
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.expire(redisKey, windowSeconds);
    }
    const allowed = count <= limit;
    return {
      allowed,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: allowed ? 0 : windowSeconds,
    };
  }

  private checkMemory(
    key: string,
    limit: number,
    windowSeconds: number,
  ): RateLimitResult {
    const now = Date.now();
    const existing = this.memoryCounters.get(key);
    if (!existing || existing.resetAt <= now) {
      this.memoryCounters.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
    }
    existing.count += 1;
    const allowed = existing.count <= limit;
    return {
      allowed,
      remaining: Math.max(0, limit - existing.count),
      retryAfterSeconds: allowed ? 0 : Math.ceil((existing.resetAt - now) / 1000),
    };
  }
}
