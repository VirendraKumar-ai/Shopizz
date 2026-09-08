import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { users } from './users'

export const orderStatusEnum = pgEnum('order_status', [
  'PLACED',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
])

export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING',
  'PAID',
  'FAILED',
  'REFUNDED',
])

export const orders = pgTable('orders', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  orderNumber: text('order_number')
    .notNull()
    .unique(),

  buyerId: uuid('buyer_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'restrict',
    }),

  status: orderStatusEnum('status')
    .default('PLACED')
    .notNull(),

  // Money stored in paise (100 paise = ₹1.00)
  subtotal: integer('subtotal')
    .notNull(),

  shippingFee: integer('shipping_fee')
    .default(0)
    .notNull(),

  taxAmount: integer('tax_amount')
    .default(0)
    .notNull(),

  discountAmount: integer('discount_amount')
    .default(0)
    .notNull(),

  totalAmount: integer('total_amount')
    .notNull(),

  shippingName: text('shipping_name')
    .notNull(),

  shippingPhone: text('shipping_phone')
    .notNull(),

  shippingAddress: text('shipping_address')
    .notNull(),

  shippingCity: text('shipping_city')
    .notNull(),

  shippingState: text('shipping_state')
    .notNull(),

  shippingPostalCode: text('shipping_postal_code')
    .notNull(),

  shippingCountry: text('shipping_country')
    .default('India')
    .notNull(),

  paymentStatus: paymentStatusEnum('payment_status')
    .default('PENDING')
    .notNull(),

  paymentMethod: text('payment_method')
    .default('ONLINE')
    .notNull(),

  razorpayOrderId: text('razorpay_order_id'),
  razorpayPaymentId: text('razorpay_payment_id'),
  razorpaySignature: text('razorpay_signature'),

  notes: text('notes'),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
})
