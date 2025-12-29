import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const notificationSchema = pgTable(
  'notification',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    deviceId: uuid('device_id').notNull(),
    direction: varchar('direction', { length: 20 }).notNull(), // 'web_to_android' or 'android_to_web'
    title: varchar('title', { length: 200 }),
    message: text('message'),
    payload: jsonb('payload'), // Additional data as JSON
    status: varchar('status', { length: 20 })
      .default('pending')
      .notNull(), // 'pending', 'sent', 'failed', 'delivered'
    webhookUrl: text('webhook_url'), // URL to send webhook to (Android FCM endpoint or web endpoint)
    retryCount: integer('retry_count').default(0).notNull(),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull(),
    sentAt: timestamp('sent_at'),
  },
);

export type Notification = InferSelectModel<typeof notificationSchema>;
export type NewNotification = InferInsertModel<typeof notificationSchema>;
