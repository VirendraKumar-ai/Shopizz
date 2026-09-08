import {
  pgTable,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './users'
import { products } from './products'

export const wishlists = pgTable('wishlists', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),

  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, {
      onDelete: 'cascade',
    }),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
}, (table) => [
  unique('user_product_unique').on(table.userId, table.productId),
])
