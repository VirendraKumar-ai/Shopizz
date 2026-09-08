import { eq, or } from 'drizzle-orm'
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

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      or(
        eq(notifications.userId, user.id),
        and(isNull(notifications.userId), isNull(notifications.role)),
        and(isNull(notifications.userId), eq(notifications.role, user.role))
      )
    )

  return {
    success: true,
    message: 'All notifications marked as read',
  }
})
