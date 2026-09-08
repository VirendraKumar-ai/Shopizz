import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core'

import { users } from './users'

export const ownerApplicationStatusEnum = pgEnum(
  'owner_application_status',
  [
    'PENDING',
    'APPROVED',
    'REJECTED'
  ]
)

export const ownerApplications = pgTable('owner_applications', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade'
    }),

  shopName: text('shop_name')
    .notNull(),

  description: text('description'),

  imageUrl: text('image_url'),

  logoUrl: text('logo_url'),

  phone: text('phone'),

  address: text('address'),

  reason: text('reason'),

  status: ownerApplicationStatusEnum('status')
    .default('PENDING')
    .notNull(),

  rejectionReason: text('rejection_reason'),

  reviewedBy: uuid('reviewed_by')
    .references(() => users.id, {
      onDelete: 'set null'
    }),

  reviewedAt: timestamp('reviewed_at', {
    withTimezone: true
  }),

  createdAt: timestamp('created_at', {
    withTimezone: true
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', {
    withTimezone: true
  })
    .defaultNow()
    .notNull()
})