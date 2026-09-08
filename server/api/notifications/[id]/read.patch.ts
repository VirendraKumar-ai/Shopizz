import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { notifications } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const user = session?.user

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Notification ID required',
    })
  }

  const [updated] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, id))
    .returning()

  return {
    success: true,
    notification: updated,
  }
})
