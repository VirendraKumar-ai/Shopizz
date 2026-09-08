import { and, desc, eq, isNull, or, sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { notifications } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const user = session?.user

  if (!user) {
    return {
      success: true,
      notifications: [],
      unreadCount: 0,
    }
  }

  // 1. Private to this user (userId == user.id)
  // 2. Global broadcast to everyone (userId IS NULL and role IS NULL)
  // 3. Role broadcast (userId IS NULL and role == user.role)
  const userNotifications = await db
    .select()
    .from(notifications)
    .where(
      or(
        eq(notifications.userId, user.id),
        and(isNull(notifications.userId), isNull(notifications.role)),
        and(isNull(notifications.userId), eq(notifications.role, user.role))
      )
    )
    .orderBy(desc(notifications.createdAt))
    .limit(20)

  const unreadCount = userNotifications.filter((n) => !n.isRead).length

  return {
    success: true,
    notifications: userNotifications,
    unreadCount,
  }
})
