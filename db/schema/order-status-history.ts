import {
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { orders } from './orders'
import { users } from './users'

export const orderStatusHistory = pgTable('order_status_history', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, {
      onDelete: 'cascade',
    }),

  status: text('status')
    .notNull(),

  message: text('message'),

  updatedBy: uuid('updated_by')
    .references(() => users.id, {
      onDelete: 'set null',
    }),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
})
