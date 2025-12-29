import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';

export const userSchema = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }),
  username: varchar('username', { length: 100 }).unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  nrc: varchar('nrc', { length: 50 }).unique(),
  phoneNumber: varchar('phone_number', {
    length: 20,
  }).unique(),
  address: varchar('address', { length: 500 }),
  isActive: boolean('is_active').default(true).notNull(),
  lastLogin: timestamp('last_login'),
  // Password reset fields
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpires: timestamp('password_reset_expires'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof userSchema.$inferSelect;
export type NewUser = typeof userSchema.$inferInsert;
