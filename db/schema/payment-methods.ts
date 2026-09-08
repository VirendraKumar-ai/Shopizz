import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const paymentTypeEnum = pgEnum('payment_type', [
  'CARD',
  'UPI',
  'NET_BANKING',
])

export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),

  type: paymentTypeEnum('type')
    .notNull(),

  provider: text('provider')
    .notNull(), // 'Visa', 'Mastercard', 'RuPay', 'PhonePe', 'Google Pay', 'Paytm'

  identifier: text('identifier')
    .notNull(), // Masked card number '4567' or UPI ID 'buyer@ybl'

  holderName: text('holder_name'),

  expiryMonth: text('expiry_month'),

  expiryYear: text('expiry_year'),

  isDefault: boolean('is_default')
    .default(false)
    .notNull(),

  details: jsonb('details'),

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
