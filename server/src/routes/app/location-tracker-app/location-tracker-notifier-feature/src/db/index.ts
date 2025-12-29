import {
  drizzle,
  NodePgDatabase,
} from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getDatabaseUrl, runMigrations } from './migrate';

export function createConnectionPostgres(
  dbUrl: string,
): NodePgDatabase {
  const pool = new Pool({
    connectionString: dbUrl,
  });
  return drizzle(pool);
}

const dbUrl = getDatabaseUrl();

export const db = createConnectionPostgres(dbUrl);

// Run migrations on startup
runMigrations().catch((error) => {
  console.error(
    'Failed to run migrations on startup:',
    error,
  );
  // Don't exit - allow the app to continue
});

