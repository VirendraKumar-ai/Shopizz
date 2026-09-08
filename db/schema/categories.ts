import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const categories = pgTable('categories', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  name: text('name')
    .notNull(),

  slug: text('slug')
    .notNull()
    .unique(),

  description: text('description'),

  imageUrl: text('image_url'),

  status: text('status')
    .default('ACTIVE')
    .notNull(),

  sortOrder: integer('sort_order')
    .default(0)
    .notNull(),

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