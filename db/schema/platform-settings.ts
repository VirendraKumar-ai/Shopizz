import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const platformSettings = pgTable('platform_settings', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  announcementText: text('announcement_text')
    .default('✦ Free shipping on orders above ₹1499 • Easy returns ✦')
    .notNull(),

  commissionRatePercent: integer('commission_rate_percent')
    .default(10)
    .notNull(),

  supportEmail: text('support_email')
    .default('support@shopizz.com')
    .notNull(),

  supportPhone: text('support_phone')
    .default('+91 1800 123 4567')
    .notNull(),

  updatedAt: timestamp('updated_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
})
