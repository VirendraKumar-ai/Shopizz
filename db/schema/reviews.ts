import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core'

import { products } from './products'
import { users } from './users'

export const reviewStatusEnum = pgEnum('review_status', [
  'PUBLISHED',
  'HIDDEN'
])

export const reviews = pgTable('reviews', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, {
      onDelete: 'cascade'
    }),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade'
    }),

  rating: integer('rating')
    .notNull(),

  title: text('title'),

  comment: text('comment')
    .notNull(),

  isVerifiedPurchase: boolean('is_verified_purchase')
    .default(false)
    .notNull(),

  sellerReply: text('seller_reply'),

  sellerRepliedAt: timestamp('seller_replied_at', {
    withTimezone: true
  }),

  status: reviewStatusEnum('status')
    .default('PUBLISHED')
    .notNull(),

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
