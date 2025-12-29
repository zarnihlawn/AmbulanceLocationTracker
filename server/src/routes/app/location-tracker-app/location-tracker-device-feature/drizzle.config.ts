import type { Config } from 'drizzle-kit';
import { databaseEnv } from './src/config/database.config';

export default {
  schema: './src/schema/*.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: databaseEnv.MAIN_POSTGRES_HOST,
    port: databaseEnv.MAIN_POSTGRES_PORT,
    user: databaseEnv.MAIN_POSTGRES_USERNAME,
    password: databaseEnv.MAIN_POSTGRES_PASSWORD,
    database: databaseEnv.LOCATION_TRACKER_DEVICE_DATABASE,
  },
} satisfies Config;
