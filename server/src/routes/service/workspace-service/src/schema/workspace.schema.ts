import {
  pgTable,
  uuid,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const workspaces = pgTable('workspace', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  featureId: uuid('feature_id').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  description: varchar('description', {
    length: 500,
  }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
