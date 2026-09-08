import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { users } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const currentAdmin = await requireAdmin(event)

  const targetUserId = getRouterParam(event, 'id')
  if (!targetUserId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required',
    })
  }

  const body = await readBody(event)
  const { isActive, role } = body

  // Check target user
  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
  })

  if (!targetUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  // Prevent admin from deactivating or demoting themselves
  if (currentAdmin.id === targetUserId) {
    if (isActive === false) {
      throw createError({
        statusCode: 400,
        statusMessage: 'You cannot deactivate your own administrative account.',
      })
    }
    if (role && role !== 'ADMIN') {
      throw createError({
        statusCode: 400,
        statusMessage: 'You cannot demote your own administrative role.',
      })
    }
  }

  const updates: Record<string, any> = {
    updatedAt: new Date(),
  }

  if (isActive !== undefined) {
    updates.isActive = Boolean(isActive)
  }

  if (role !== undefined) {
    const validRoles = ['BUYER', 'OWNER', 'ADMIN']
    if (!validRoles.includes(role)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      })
    }
    updates.role = role
  }

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, targetUserId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      updatedAt: users.updatedAt,
    })

  return {
    success: true,
    message: 'User updated successfully',
    user: updated,
  }
})
