import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const feature = pgTable('feature', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').notNull(),
  name: varchar('name', { length: 100 }).unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Feature = typeof feature.$inferSelect;
export type NewFeature = typeof feature.$inferInsert;
