import { asc, eq, sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { supportConversations, supportMessages, users, orders } from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const conversationId = getRouterParam(event, 'id')

  if (!conversationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID required',
    })
  }

  // 1. Fetch conversation details
  const [conversation] = await db
    .select({
      id: supportConversations.id,
      buyerId: supportConversations.buyerId,
      recipientId: supportConversations.recipientId,
      channelType: supportConversations.channelType,
      shopId: supportConversations.shopId,
      buyerName: users.name,
      buyerEmail: users.email,
      orderId: supportConversations.orderId,
      orderNumber: orders.orderNumber,
      subject: supportConversations.subject,
      category: supportConversations.category,
      status: supportConversations.status,
      createdAt: supportConversations.createdAt,
      lastMessageAt: supportConversations.lastMessageAt,
    })
    .from(supportConversations)
    .innerJoin(users, eq(supportConversations.buyerId, users.id))
    .leftJoin(orders, eq(supportConversations.orderId, orders.id))
    .where(eq(supportConversations.id, conversationId))
    .limit(1)

  if (!conversation) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Conversation not found',
    })
  }

  // Security check: Must be the buyer, recipient (owner/maker), or an admin
  const isAuthorized =
    user.role === 'ADMIN' ||
    conversation.buyerId === user.id ||
    conversation.recipientId === user.id

  if (!isAuthorized) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You do not have access to this conversation',
    })
  }

  // 2. Fetch all messages in this conversation
  const messageRows = await db
    .select({
      id: supportMessages.id,
      conversationId: supportMessages.conversationId,
      senderId: supportMessages.senderId,
      senderRole: supportMessages.senderRole,
      senderName: supportMessages.senderName,
      message: supportMessages.message,
      isRead: supportMessages.isRead,
      createdAt: supportMessages.createdAt,
    })
    .from(supportMessages)
    .where(eq(supportMessages.conversationId, conversationId))
    .orderBy(asc(supportMessages.createdAt))

  // 3. Mark unread messages sent by the other party as read
  try {
    await db
      .update(supportMessages)
      .set({ isRead: true })
      .where(
        sql`${supportMessages.conversationId} = ${conversationId} AND ${supportMessages.senderId} != ${user.id} AND ${supportMessages.isRead} = false`
      )
  } catch (err) {
    console.error('[Support Read Mark Error]:', err)
  }

  return {
    success: true,
    conversation: {
      ...conversation,
      topic: conversation.category,
      user: {
        id: conversation.buyerId,
        name: conversation.buyerName,
        email: conversation.buyerEmail,
      },
    },
    messages: messageRows,
  }
})
