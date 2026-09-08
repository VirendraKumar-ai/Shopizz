import { eq } from 'drizzle-orm'

import { db } from '~~/server/utils/db'
import { users } from '~~/db/schema'
import { registerSchema } from '~~/shared/schemas/auth'


export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = registerSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid registration data',
      data: result.error.flatten()
    })
  }

  const {
    name,
    email,
    password
  } = result.data

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'An account with this email already exists'
    })
  }

  const passwordHash = await hashPassword(password)

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,

      // IMPORTANT:
      // Public registration ALWAYS creates BUYER.
      role: 'BUYER',

      isActive: true
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role
    })

  if (!user) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to create account'
    })
  }

  await setUserSession(event, {
    user
  })

  return {
    success: true,
    user
  }
})