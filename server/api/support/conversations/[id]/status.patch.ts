import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { supportConversations } from '~~/db/schema'
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

  const body = await readBody(event)
  const { status } = body

  if (!status || !['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Valid status required (OPEN, IN_PROGRESS, RESOLVED)',
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

  // Security: only Admin or the buyer owner can mark resolved
  if (user.role !== 'ADMIN' && conversation.buyerId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Not authorized to change status of this thread',
    })
  }

  const [updated] = await db
    .update(supportConversations)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(supportConversations.id, conversationId))
    .returning()

  return {
    success: true,
    conversation: updated,
  }
})
