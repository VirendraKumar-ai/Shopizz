import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const emailVerifications = pgTable('email_verifications', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  email: text('email')
    .notNull(),

  otp: text('otp')
    .notNull(),

  name: text('name')
    .notNull(),

  passwordHash: text('password_hash')
    .notNull(),

  expiresAt: timestamp('expires_at', {
    withTimezone: true,
  }).notNull(),

  isVerified: boolean('is_verified')
    .default(false)
    .notNull(),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
})
