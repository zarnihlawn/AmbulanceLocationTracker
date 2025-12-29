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
  const dbName = databaseEnv.ACCOUNT_DATABASE;
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
  const dbName = databaseEnv.ACCOUNT_DATABASE;

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

    // Create connection to the target database
    const pool = new Pool({
      connectionString: getDatabaseUrl(),
    });

    const db = drizzle(pool);

    // Run migrations
    console.log('Running migrations...');
    // Get migrations folder path - from src/db/ go up to gateway-record root, then into drizzle
    // __dirname is: .../gateway-record/src/db
    // We need: .../gateway-record/drizzle
    // So: up 2 levels (db -> src -> gateway-record) then into drizzle
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
      await pool.end();
      return;
    }

    await migrate(db, { migrationsFolder: migrationsPath });
    console.log('Migrations completed successfully');

    await pool.end();
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}
