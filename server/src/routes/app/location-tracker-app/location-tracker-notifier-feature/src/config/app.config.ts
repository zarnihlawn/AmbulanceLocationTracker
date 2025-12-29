import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({
  path: '../../../../.env',
});

export const appConfigSchema = z.object({
  LOCATION_TRACKER_NOTIFIER_PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(4003),
  LOCATION_TRACKER_NOTIFIER_HOST: z
    .string()
    .min(1)
    .default('localhost'),
});

export const appEnv = appConfigSchema.parse(process.env);

