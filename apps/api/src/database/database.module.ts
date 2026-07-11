import { Global, Module } from '@nestjs/common';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema/index.js';
import { createTenantAwareDb } from './tenant-aware-drizzle.js';

export const DRIZZLE = Symbol('DRIZZLE');
export const POSTGRES_CLIENT = Symbol('POSTGRES_CLIENT');
export type DrizzleDb = PostgresJsDatabase<typeof schema>;

@Global()
@Module({
  providers: [
    {
      provide: POSTGRES_CLIENT,
      useFactory: () => {
        const url = process.env['DATABASE_URL'];
        if (!url) {
          throw new Error('DATABASE_URL is required');
        }
        return postgres(url, { max: 10 });
      },
    },
    {
      provide: DRIZZLE,
      inject: [POSTGRES_CLIENT],
      useFactory: (client: postgres.Sql): DrizzleDb =>
        createTenantAwareDb(drizzle(client, { schema })),
    },
  ],
  exports: [DRIZZLE, POSTGRES_CLIENT],
})
export class DatabaseModule {}
