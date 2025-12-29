import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({
  path: '../../../../../.env',
});

export const databaseConfigSchema = z.object({
  MAIN_POSTGRES_HOST: z.string().min(1),
  MAIN_POSTGRES_PORT: z.coerce.number().int().positive(),
  MAIN_POSTGRES_USERNAME: z.string().min(1),
  MAIN_POSTGRES_PASSWORD: z.string().min(1),
  LOCATION_TRACKER_TRACKING_DATABASE: z.string().min(1),
});

export const databaseEnv = databaseConfigSchema.parse(
  process.env,
);

