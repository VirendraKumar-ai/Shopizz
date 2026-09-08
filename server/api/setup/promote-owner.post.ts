import { eq } from 'drizzle-orm'

import { db } from '~~/server/utils/db'
import { users } from '~~/db/schema/users'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const email = body?.email?.trim()?.toLowerCase()

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required.',
    })
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found.',
    })
  }

  if (user.role === 'ADMIN') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Admin cannot be promoted to OWNER.',
    })
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      role: 'OWNER',
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })

  return {
    success: true,
    message: 'User promoted to OWNER successfully.',
    user: updatedUser,
  }
})