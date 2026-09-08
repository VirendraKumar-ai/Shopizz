import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { orders } from './orders'
import { products } from './products'
import { users } from './users'

export const orderItems = pgTable('order_items', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, {
      onDelete: 'cascade',
    }),

  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, {
      onDelete: 'restrict',
    }),

  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'restrict',
    }),

  productName: text('product_name'),

  productSku: text('product_sku'),

  productImageUrl: text('product_image_url'),

  quantity: integer('quantity')
    .notNull(),

  // Stored in paise
  unitPrice: integer('unit_price')
    .notNull(),

  totalPrice: integer('total_price')
    .notNull(),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
})
