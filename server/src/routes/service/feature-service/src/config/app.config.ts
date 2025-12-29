import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({
  path: '../../../../.env',
});

export const appConfigSchema = z.object({
  FEATURE_PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(4000),
  FEATURE_HOST: z.string().min(1).default('0.0.0.0'),
});

export const appEnv = appConfigSchema.parse(process.env);
