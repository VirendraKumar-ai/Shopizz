import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const addresses = pgTable('addresses', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),

  fullName: text('full_name')
    .notNull(),

  phone: text('phone')
    .notNull(),

  addressLine1: text('address_line1')
    .notNull(),

  addressLine2: text('address_line2'),

  city: text('city')
    .notNull(),

  state: text('state')
    .notNull(),

  postalCode: text('postal_code')
    .notNull(),

  country: text('country')
    .default('India')
    .notNull(),

  type: text('type')
    .default('HOME')
    .notNull(), // 'HOME' | 'WORK' | 'OTHER'

  isDefault: boolean('is_default')
    .default(false)
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
