import { fileURLToPath } from 'bun';
import path from 'path';
import { databaseEnv } from '../config/database.config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { existsSync } from 'fs';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getDatabaseUrl = (): string => {
  const dbHost = databaseEnv.MAIN_POSTGRES_HOST;
  const dbPort = databaseEnv.MAIN_POSTGRES_PORT;
  const dbUser = databaseEnv.MAIN_POSTGRES_USERNAME;
  const dbPassword = databaseEnv.MAIN_POSTGRES_PASSWORD;
  const dbName = databaseEnv.LOCATION_TRACKER_TRACKING_DATABASE;
  return `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
};

export const getMainDatabaseUrl = (): string => {
  const dbHost = databaseEnv.MAIN_POSTGRES_HOST;
  const dbPort = databaseEnv.MAIN_POSTGRES_PORT;
  const dbUser = databaseEnv.MAIN_POSTGRES_USERNAME;
  const dbPassword = databaseEnv.MAIN_POSTGRES_PASSWORD;
  return `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/postgres`;
};

/**
 * Create database if it doesn't exist
 */
async function ensureDatabase(): Promise<void> {
  const dbName = databaseEnv.LOCATION_TRACKER_TRACKING_DATABASE;

  const mainPool = new Pool({
    connectionString: getMainDatabaseUrl(),
  });

  try {
    // Check if database exists
    const result = await mainPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName],
    );

    if (result.rows.length === 0) {
      // Create database
      await mainPool.query(`CREATE DATABASE ${dbName}`);
      console.log(
        `Database '${dbName}' created successfully`,
      );
    } else {
      console.log(`Database '${dbName}' already exists`);
    }
  } catch (error) {
    console.error('Error ensuring database:', error);
    throw error;
  } finally {
    await mainPool.end();
  }
}

/**
 * Run migrations
 */
export async function runMigrations(): Promise<void> {
  try {
    // First, ensure database exists
    await ensureDatabase();

    // Create a separate connection pool for migrations (to avoid conflicts)
    const migrationPool = new Pool({
      connectionString: getDatabaseUrl(),
    });

    const migrationDb = drizzle(migrationPool);

    // Run migrations
    console.log('Running migrations...');
    const migrationsPath = path.join(
      __dirname,
      '../../drizzle',
    );

    // Verify the path exists
    if (!existsSync(migrationsPath)) {
      throw new Error(
        `Migrations folder not found at: ${migrationsPath}`,
      );
    }

    const journalPath = path.join(
      migrationsPath,
      'meta/_journal.json',
    );
    if (!existsSync(journalPath)) {
      console.warn(
        `Migration journal not found at: ${journalPath}. Skipping migrations. Run 'drizzle-kit generate' to create migrations.`,
      );
      await migrationPool.end();
      return;
    }

    await migrate(migrationDb, { migrationsFolder: migrationsPath });
    console.log('Migrations completed successfully');

    // Close the migration pool - we have a separate pool for the app in db/index.ts
    await migrationPool.end();
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

