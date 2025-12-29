import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  jsonb,
} from 'drizzle-orm/pg-core';

export const locationTrackerTaskSchema = pgTable(
  'location_tracker_task',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    deviceId: uuid('device_id').notNull(),
    type: varchar('type', { length: 50 }).notNull(), // 'text' or 'location'
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description'),
    // For location tasks
    targetLatitude: text('target_latitude'), // Store as text to preserve precision
    targetLongitude: text('target_longitude'),
    // Status: 'pending', 'accepted', 'rejected', 'na', 'completed'
    status: varchar('status', { length: 20 })
      .default('pending')
      .notNull(),
    // Response from Android
    responseMessage: text('response_message'),
    // Additional metadata
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull(),
    completedAt: timestamp('completed_at'),
    respondedAt: timestamp('responded_at'),
  },
);

export type LocationTrackerTask =
  typeof locationTrackerTaskSchema.$inferSelect;
export type NewLocationTrackerTask =
  typeof locationTrackerTaskSchema.$inferInsert;

