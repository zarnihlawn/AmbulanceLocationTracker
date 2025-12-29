import {
  pgTable,
  uuid,
  timestamp,
  boolean,
  text,
} from 'drizzle-orm/pg-core';
import { userSchema } from './user.schema';

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => userSchema.id, { onDelete: 'cascade' })
    .notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  isRevoked: boolean('is_revoked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type RefreshToken =
  typeof refreshTokens.$inferSelect;
export type NewRefreshToken =
  typeof refreshTokens.$inferInsert;
