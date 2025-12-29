import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const organizations = pgTable('organization', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  profile: text('profile'),
  banner: text('banner'),
  description: varchar('description', {
    length: 500,
  }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Organization =
  typeof organizations.$inferSelect;
export type NewOrganization =
  typeof organizations.$inferInsert;
