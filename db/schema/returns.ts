import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core'

import { orders } from './orders'
import { orderItems } from './order-items'
import { users } from './users'

export const returnStatusEnum = pgEnum('return_status', [
  'REQUESTED',
  'APPROVED',
  'ITEM_RECEIVED',
  'REFUNDED',
  'REJECTED'
])

export const returnReasonEnum = pgEnum('return_reason', [
  'DEFECTIVE_DAMAGED',
  'SIZE_FIT_ISSUE',
  'NOT_AS_DESCRIBED',
  'CHANGED_MIND',
  'LATE_DELIVERY',
  'OTHER'
])

export const returnRequests = pgTable('return_requests', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  returnNumber: text('return_number')
    .notNull()
    .unique(),

  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, {
      onDelete: 'cascade'
    }),

  orderItemId: uuid('order_item_id')
    .references(() => orderItems.id, {
      onDelete: 'set null'
    }),

  buyerId: uuid('buyer_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'restrict'
    }),

  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'restrict'
    }),

  reason: returnReasonEnum('reason')
    .notNull(),

  reasonDetails: text('reason_details'),

  images: jsonb('images'),

  refundAmount: integer('refund_amount')
    .notNull(),

  payoutDetails: jsonb('payout_details'),

  status: returnStatusEnum('status')
    .default('REQUESTED')
    .notNull(),

  sellerNotes: text('seller_notes'),

  rejectionReason: text('rejection_reason'),

  refundTransactionId: text('refund_transaction_id'),

  requestedAt: timestamp('requested_at', {
    withTimezone: true
  })
    .defaultNow()
    .notNull(),

  approvedAt: timestamp('approved_at', {
    withTimezone: true
  }),

  receivedAt: timestamp('received_at', {
    withTimezone: true
  }),

  refundedAt: timestamp('refunded_at', {
    withTimezone: true
  }),

  rejectedAt: timestamp('rejected_at', {
    withTimezone: true
  }),

  updatedAt: timestamp('updated_at', {
    withTimezone: true
  })
    .defaultNow()
    .notNull()
})
