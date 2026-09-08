import {
  integer,
  pgTable,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core'

import { products } from './products'

export const inventory = pgTable('inventory', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  productId: uuid('product_id')
    .notNull()
    .unique()
    .references(() => products.id, {
      onDelete: 'cascade'
    }),

  quantity: integer('quantity')
    .default(0)
    .notNull(),

  reservedQuantity: integer('reserved_quantity')
    .default(0)
    .notNull(),

  updatedAt: timestamp('updated_at', {
    withTimezone: true
  })
    .defaultNow()
    .notNull()
})