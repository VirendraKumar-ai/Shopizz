import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const notifications = pgTable('notifications', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  userId: uuid('user_id')
    .references(() => users.id, {
      onDelete: 'cascade',
    }),

  role: text('role'), // 'ADMIN' | 'OWNER' | 'BUYER' or null for all

  type: text('type') // 'OTP' | 'OWNER_APPLICATION_SUBMITTED' | 'OWNER_APPLICATION_APPROVED' | 'OWNER_APPLICATION_REJECTED' | 'PRODUCT_CREATED' | 'SYSTEM'
    .default('SYSTEM')
    .notNull(),

  title: text('title')
    .notNull(),

  message: text('message')
    .notNull(),

  link: text('link'),

  isRead: boolean('is_read')
    .default(false)
    .notNull(),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
})
