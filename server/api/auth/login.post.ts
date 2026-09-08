import { eq } from 'drizzle-orm'

import { db } from '~~/server/utils/db'
import { users } from '~~/db/schema'
import { loginSchema } from '~~/shared/schemas/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = loginSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid login data'
    })
  }

  const {
    email,
    password
  } = result.data

  const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  })

  // Don't reveal whether email exists.
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password'
    })
  }

  if (!user.isActive) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Your account has been disabled'
    })
  }

  const validPassword = await verifyPassword(
    user.passwordHash,
    password
  )

  if (!validPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password'
    })
  }

  await db
    .update(users)
    .set({
      lastLoginAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(users.id, user.id))

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  })

  return {
    success: true,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }
})