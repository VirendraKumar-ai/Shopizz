import { db } from '~~/server/utils/db'
import { supportConversations, supportMessages } from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'
import { createNotification } from '~~/server/utils/notifications'
import { generateAndSaveBotReply } from '~~/server/utils/conciergeBot'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const {
    subject,
    category = 'GENERAL',
    message,
    orderId = null,
    recipientId = null,
    shopId = null,
    channelType = 'BUYER_TO_ADMIN',
  } = body

  if (!subject || !subject.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Inquiry subject is required',
    })
  }

  if (!message || !message.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message content is required',
    })
  }

  // 1. Create conversation thread
  const [conversation] = await db
    .insert(supportConversations)
    .values({
      buyerId: user.id,
      recipientId: recipientId || null,
      channelType: channelType as any,
      shopId: shopId || null,
      orderId: orderId || null,
      subject: subject.trim(),
      category: category.trim() || 'GENERAL',
      status: 'OPEN',
      lastMessageAt: new Date(),
    })
    .returning()

  if (!conversation) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create conversation',
    })
  }

  // 2. Insert initial message
  const senderRole = user.role === 'ADMIN' ? 'ADMIN' : user.role === 'OWNER' ? 'OWNER' : 'BUYER'
  const [initialMessage] = await db
    .insert(supportMessages)
    .values({
      conversationId: conversation.id,
      senderId: user.id,
      senderRole,
      senderName: user.name,
      message: message.trim(),
      isRead: false,
    })
    .returning()

  // 3. Send Notifications based on channel type
  try {
    if (channelType === 'BUYER_TO_OWNER' && recipientId) {
      // Notify the Shop Owner
      await createNotification({
        userId: recipientId,
        type: 'SUPPORT_MESSAGE',
        title: 'New Customer Inquiry 💬',
        message: `${user.name} sent an inquiry: "${subject.trim()}"`,
        link: '/owner/messages',
      })
    } else if (channelType === 'OWNER_TO_ADMIN') {
      // Notify Admin of Owner message
      await createNotification({
        role: 'ADMIN',
        type: 'SUPPORT_MESSAGE',
        title: 'Artisan Owner Inquiry',
        message: `Owner ${user.name} sent a support request: "${subject.trim()}"`,
        link: '/admin/support',
      })
    } else if (channelType === 'BUYER_TO_ADMIN') {
      // Notify Admin of Buyer ticket
      await createNotification({
        role: 'ADMIN',
        type: 'SUPPORT_MESSAGE',
        title: 'New Concierge Inquiry',
        message: `${user.name} opened a support ticket: "${subject.trim()}"`,
        link: '/admin/support',
      })
    }
  } catch (err) {
    console.error('[Support Notification Error]:', err)
  }

  // 4. Trigger AI Assistant ONLY for AI_ASSISTANT channel
  let botReply = null
  if (channelType === 'AI_ASSISTANT') {
    botReply = await generateAndSaveBotReply({
      conversationId: conversation.id,
      userId: user.id,
      userName: user.name,
      userMessage: message.trim(),
      subject: subject.trim(),
      category: category.trim() || 'GENERAL',
    })
  }

  return {
    success: true,
    conversation,
    message: initialMessage,
    botReply,
  }
})
