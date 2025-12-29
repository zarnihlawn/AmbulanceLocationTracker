import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

export const visitorSchema = pgTable('visitor', {
  id: uuid('id').primaryKey().defaultRandom(),
  ipAddress: varchar('ip_address', {
    length: 45,
  }).notNull(),
  fromUrl: varchar('from_url', { length: 2048 }).notNull(),
  toUrl: varchar('to_url', { length: 2048 }),
  method: varchar('method', { length: 10 }).notNull(),
  userAgent: varchar('user_agent', { length: 500 }),
  referer: varchar('referer', { length: 2048 }),
  statusCode: integer('status_code'),
  responseTime: integer('response_time'), // in milliseconds
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Visitor = typeof visitorSchema.$inferSelect;
export type NewVisitor = typeof visitorSchema.$inferInsert;
