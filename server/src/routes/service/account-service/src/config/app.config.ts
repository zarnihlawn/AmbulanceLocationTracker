import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({
  path: '../../../../.env',
});

export const appConfig = z.object({
  ACCOUNT_PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(4000),
  ACCOUNT_HOST: z.string().min(1).default('0.0.0.0'),
  ACCOUNT_JWT_TOKEN: z
    .string()
    .min(1)
    .default('not-token-hehe'),
});

export const appEnv = appConfig.parse(process.env);
