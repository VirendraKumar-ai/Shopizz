import { desc, eq, or, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { db } from '~~/server/utils/db'
import { supportConversations, supportMessages, users, orders } from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const isAdmin = user.role === 'ADMIN'
  const isOwner = user.role === 'OWNER'

  const recipientUsers = alias(users, 'recipient_user')

  // Base query
  const query = db
    .select({
      id: supportConversations.id,
      buyerId: supportConversations.buyerId,
      buyerName: users.name,
      buyerEmail: users.email,
      recipientId: supportConversations.recipientId,
      recipientName: recipientUsers.name,
      recipientEmail: recipientUsers.email,
      channelType: supportConversations.channelType,
      shopId: supportConversations.shopId,
      orderId: supportConversations.orderId,
      orderNumber: orders.orderNumber,
      subject: supportConversations.subject,
      category: supportConversations.category,
      status: supportConversations.status,
      lastMessageAt: supportConversations.lastMessageAt,
      createdAt: supportConversations.createdAt,
      updatedAt: supportConversations.updatedAt,
    })
    .from(supportConversations)
    .innerJoin(users, eq(supportConversations.buyerId, users.id))
    .leftJoin(recipientUsers, eq(supportConversations.recipientId, recipientUsers.id))
    .leftJoin(orders, eq(supportConversations.orderId, orders.id))

  let rows: any[] = []

  if (isAdmin) {
    // Admin sees all threads
    rows = await query.orderBy(desc(supportConversations.lastMessageAt))
  } else if (isOwner) {
    // Owner sees threads where they are the recipient (customer chatting with maker) OR where they are the buyer/initiator (owner chatting with Admin)
    rows = await query
      .where(
        or(
          eq(supportConversations.recipientId, user.id),
          eq(supportConversations.buyerId, user.id)
        )
      )
      .orderBy(desc(supportConversations.lastMessageAt))
  } else {
    // Buyer sees threads they initiated
    rows = await query
      .where(eq(supportConversations.buyerId, user.id))
      .orderBy(desc(supportConversations.lastMessageAt))
  }

  // Fetch unread count & last message for each thread
  const conversationIds = rows.map((r) => r.id)
  const unreadMap = new Map<string, number>()
  const lastMessageMap = new Map<string, any>()

  if (conversationIds.length > 0) {
    const unreadMessages = await db
      .select({
        conversationId: supportMessages.conversationId,
        count: sql<number>`count(${supportMessages.id})::int`,
      })
      .from(supportMessages)
      .where(
        sql`${supportMessages.isRead} = false AND ${supportMessages.senderId} != ${user.id}`
      )
      .groupBy(supportMessages.conversationId)

    for (const u of unreadMessages) {
      unreadMap.set(u.conversationId, u.count)
    }

    // Get last messages
    const latestMessages = await db
      .select({
        id: supportMessages.id,
        conversationId: supportMessages.conversationId,
        message: supportMessages.message,
        senderName: supportMessages.senderName,
        senderRole: supportMessages.senderRole,
        isRead: supportMessages.isRead,
        createdAt: supportMessages.createdAt,
      })
      .from(supportMessages)
      .orderBy(desc(supportMessages.createdAt))

    for (const m of latestMessages) {
      if (!lastMessageMap.has(m.conversationId)) {
        lastMessageMap.set(m.conversationId, m)
      }
    }
  }

  const enhanced = rows.map((r) => ({
    ...r,
    user: {
      id: r.buyerId,
      name: r.buyerName,
      email: r.buyerEmail,
    },
    recipient: r.recipientId
      ? {
          id: r.recipientId,
          name: r.recipientName,
          email: r.recipientEmail,
        }
      : null,
    lastMessage: lastMessageMap.get(r.id) || null,
    unreadCount: unreadMap.get(r.id) || 0,
  }))

  return {
    success: true,
    conversations: enhanced,
  }
})
