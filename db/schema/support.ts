import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './users'
import { orders } from './orders'

export const supportStatusEnum = pgEnum('support_status', [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
])

export const supportRoleEnum = pgEnum('support_role', [
  'BUYER',
  'ADMIN',
  'OWNER',
  'SYSTEM',
])

export const supportChannelEnum = pgEnum('support_channel', [
  'BUYER_TO_OWNER',
  'OWNER_TO_ADMIN',
  'BUYER_TO_ADMIN',
  'AI_ASSISTANT',
])

export const supportConversations = pgTable('support_conversations', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  buyerId: uuid('buyer_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),

  recipientId: uuid('recipient_id')
    .references(() => users.id, {
      onDelete: 'set null',
    }),

  channelType: supportChannelEnum('channel_type')
    .default('BUYER_TO_ADMIN')
    .notNull(),

  shopId: uuid('shop_id'),

  orderId: uuid('order_id')
    .references(() => orders.id, {
      onDelete: 'set null',
    }),

  subject: text('subject')
    .notNull(),

  category: text('category')
    .default('GENERAL')
    .notNull(),

  status: supportStatusEnum('status')
    .default('OPEN')
    .notNull(),

  lastMessageAt: timestamp('last_message_at', {
    withTimezone: true,
  })
    .defaultNow()
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

export const supportMessages = pgTable('support_messages', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => supportConversations.id, {
      onDelete: 'cascade',
    }),

  senderId: uuid('sender_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),

  senderRole: supportRoleEnum('sender_role')
    .default('BUYER')
    .notNull(),

  senderName: text('sender_name')
    .notNull(),

  message: text('message')
    .notNull(),

  isRead: boolean('is_read')
    .default(false)
    .notNull(),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
})
