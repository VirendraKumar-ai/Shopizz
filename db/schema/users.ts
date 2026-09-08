import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', [
  'ADMIN',
  'BUYER',
  'OWNER'
])

export const users = pgTable('users', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  name: text('name')
    .notNull(),

  email: text('email')
    .notNull()
    .unique(),

  passwordHash: text('password_hash')
    .notNull(),

  role: userRoleEnum('role')
    .default('BUYER')
    .notNull(),

  isActive: boolean('is_active')
    .default(true)
    .notNull(),

  lastLoginAt: timestamp('last_login_at', {
    withTimezone: true
  }),

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