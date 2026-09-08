import { db } from './db'
import { notifications } from '../../db/schema/notifications'

interface CreateNotificationParams {
  userId?: string | null
  role?: 'ADMIN' | 'OWNER' | 'BUYER' | null
  type?: string
  title: string
  message: string
  link?: string | null
}

export async function createNotification({
  userId = null,
  role = null,
  type = 'SYSTEM',
  title,
  message,
  link = null,
}: CreateNotificationParams) {
  try {
    const [inserted] = await db
      .insert(notifications)
      .values({
        userId: userId || null,
        role: role || null,
        type,
        title,
        message,
        link: link || null,
        isRead: false,
      })
      .returning()

    console.log(`[Notification Created] ${title} (${type}) for user: ${userId || 'role:' + role}`)
    return inserted
  } catch (err) {
    console.error('[Notification Error] Failed to create notification:', err)
    return null
  }
}
