import {
  boolean,
  integer,
  pgTable,
  text,
  uuid
} from 'drizzle-orm/pg-core'

import { products } from './products'

export const productImages = pgTable('product_images', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, {
      onDelete: 'cascade'
    }),

  url: text('url')
    .notNull(),

  publicId: text('public_id'),

  alt: text('alt'),

  sortOrder: integer('sort_order')
    .default(0)
    .notNull(),

  isPrimary: boolean('is_primary')
    .default(false)
    .notNull()
})