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
runMigrations()
  .then(() => {
    console.log('Database migrations completed successfully');
  })
  .catch((error) => {
    console.error('Failed to run migrations:', error);
    // Don't exit in development - allow service to continue
    // In production, you might want to exit here: process.exit(1);
  });

