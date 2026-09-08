import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { supportConversations, supportMessages } from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'
import { createNotification } from '~~/server/utils/notifications'
import { generateAndSaveBotReply } from '~~/server/utils/conciergeBot'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const conversationId = getRouterParam(event, 'id')

  if (!conversationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID required',
    })
  }

  const body = await readBody(event)
  const { message } = body

  if (!message || !message.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message text cannot be empty',
    })
  }

  // 1. Fetch conversation
  const [conversation] = await db
    .select()
    .from(supportConversations)
    .where(eq(supportConversations.id, conversationId))
    .limit(1)

  if (!conversation) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Conversation not found',
    })
  }

  const isAdmin = user.role === 'ADMIN'
  const isParticipant =
    conversation.buyerId === user.id ||
    conversation.recipientId === user.id ||
    isAdmin

  if (!isParticipant) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You do not have access to reply to this thread',
    })
  }

  const senderRole = isAdmin ? 'ADMIN' : user.role === 'OWNER' ? 'OWNER' : 'BUYER'

  // 2. Insert message
  const [insertedMessage] = await db
    .insert(supportMessages)
    .values({
      conversationId,
      senderId: user.id,
      senderRole,
      senderName: user.name,
      message: message.trim(),
      isRead: false,
    })
    .returning()

  // 3. Update conversation lastMessageAt and status
  const nextStatus = isAdmin ? 'IN_PROGRESS' : conversation.status === 'RESOLVED' ? 'OPEN' : conversation.status
  await db
    .update(supportConversations)
    .set({
      lastMessageAt: new Date(),
      status: nextStatus,
      updatedAt: new Date(),
    })
    .where(eq(supportConversations.id, conversationId))

  // 4. Send Notification to recipient
  try {
    if (conversation.channelType === 'BUYER_TO_OWNER') {
      if (user.id === conversation.buyerId && conversation.recipientId) {
        // Buyer sent message -> notify owner
        await createNotification({
          userId: conversation.recipientId,
          type: 'SUPPORT_MESSAGE',
          title: 'Customer Message 💬',
          message: `${user.name}: "${message.trim().slice(0, 80)}"`,
          link: '/owner/messages',
        })
      } else if (user.id === conversation.recipientId) {
        // Owner replied -> notify buyer
        await createNotification({
          userId: conversation.buyerId,
          type: 'SUPPORT_REPLY',
          title: 'Maker Replied 💬',
          message: `${user.name} replied to your inquiry`,
          link: '/account',
        })
      }
    } else if (conversation.channelType === 'OWNER_TO_ADMIN' || conversation.channelType === 'BUYER_TO_ADMIN') {
      if (isAdmin) {
        // Admin replied -> notify user
        await createNotification({
          userId: conversation.buyerId,
          type: 'SUPPORT_REPLY',
          title: 'Shopizz Support Replied 💬',
          message: `Support Desk replied to "${conversation.subject}"`,
          link: user.role === 'OWNER' ? '/owner/messages' : '/account',
        })
      } else {
        // User replied -> notify admin
        await createNotification({
          role: 'ADMIN',
          type: 'SUPPORT_MESSAGE',
          title: 'Support Thread Reply',
          message: `${user.name} replied to "${conversation.subject}"`,
          link: '/admin/support',
        })
      }
    }
  } catch (err) {
    console.error('[Support Message Notification Error]:', err)
  }

  // 5. Trigger AI Assistant ONLY if channelType is AI_ASSISTANT
  let botReply = null
  if (conversation.channelType === 'AI_ASSISTANT' && !isAdmin) {
    botReply = await generateAndSaveBotReply({
      conversationId,
      userId: user.id,
      userName: user.name,
      userMessage: message.trim(),
      subject: conversation.subject,
      category: conversation.category,
    })
  }

  return {
    success: true,
    message: insertedMessage,
    botReply,
  }
})
