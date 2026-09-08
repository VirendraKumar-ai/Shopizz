import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core'

import { categories } from './categories'
import { users } from './users'

export const productStatusEnum = pgEnum('product_status', [
  'DRAFT',
  'ACTIVE',
  'ARCHIVED'
])

export const products = pgTable('products', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'restrict'
    }),

  categoryId: uuid('category_id')
    .references(() => categories.id, {
      onDelete: 'set null'
    }),

  name: text('name')
    .notNull(),

  slug: text('slug')
    .notNull()
    .unique(),

  sku: text('sku')
    .notNull()
    .unique(),

  shortDescription: text('short_description'),

  description: text('description'),

  /*
   * Store money in paise.
   *
   * ₹1,999 = 199900
   */
  price: integer('price')
    .notNull(),

  compareAtPrice: integer('compare_at_price'),

  /*
   * Owner's product cost.
   */
  costPrice: integer('cost_price')
    .notNull(),

  /*
   * Dynamic variant attributes & specifications (JSONB)
   */
  colors: jsonb('colors'),
  sizes: jsonb('sizes'),
  details: jsonb('details'),

  /*
   * Social proof & customer ratings
   */
  rating: real('rating')
    .default(4.8)
    .notNull(),

  reviewCount: integer('review_count')
    .default(120)
    .notNull(),

  soldCount: integer('sold_count')
    .default(326)
    .notNull(),

  status: productStatusEnum('status')
    .default('DRAFT')
    .notNull(),

  isFeatured: boolean('is_featured')
    .default(false)
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