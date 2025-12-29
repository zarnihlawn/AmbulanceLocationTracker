import {
  doublePrecision,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const locationTrackingSchema = pgTable(
  'location_tracking_tracker',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    deviceId: uuid('device_id').notNull(), // References location_tracker_device.id
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    accuracy: doublePrecision('accuracy'), // Location accuracy in meters
    altitude: doublePrecision('altitude'), // Altitude in meters
    speed: doublePrecision('speed'), // Speed in m/s
    heading: doublePrecision('heading'), // Bearing in degrees
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
);

export type LocationTracking = typeof locationTrackingSchema.$inferSelect;
export type NewLocationTracking = typeof locationTrackingSchema.$inferInsert;

