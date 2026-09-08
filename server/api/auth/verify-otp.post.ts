import { desc, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { users, emailVerifications } from '~~/db/schema'
import { verifyOtpSchema } from '~~/shared/schemas/auth'
import { sendWelcomeEmail } from '~~/server/utils/mailer'
import { createNotification } from '~~/server/utils/notifications'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = verifyOtpSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid verification request',
      data: result.error.flatten(),
    })
  }

  const { email, otp } = result.data

  // 1. Fetch the verification record
  const record = await db.query.emailVerifications.findFirst({
    where: eq(emailVerifications.email, email),
    orderBy: desc(emailVerifications.createdAt),
  })

  if (!record) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Verification session not found. Please sign up again.',
    })
  }

  if (new Date() > new Date(record.expiresAt)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Verification code has expired. Please request a new code.',
    })
  }

  if (record.otp !== otp) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid verification code. Please check and try again.',
    })
  }

  // 2. Double check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'An account with this email already exists',
    })
  }

  // 3. Create user in database
  const [user] = await db
    .insert(users)
    .values({
      name: record.name,
      email: record.email,
      passwordHash: record.passwordHash,
      role: 'BUYER',
      isActive: true,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })

  if (!user) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to create user account',
    })
  }

  // 4. Remove verification record
  await db.delete(emailVerifications).where(eq(emailVerifications.email, email))

  // 5. Establish session
  await setUserSession(event, {
    user,
  })

  // 6. Send Welcome Email & in-app notification asynchronously
  sendWelcomeEmail(user.email, user.name).catch((err) =>
    console.error('[Welcome Email Error]:', err)
  )

  createNotification({
    userId: user.id,
    type: 'WELCOME',
    title: 'Welcome to Shopizz!',
    message: 'Your account is verified. Start exploring curated goods and independent studios.',
    link: '/shop',
  }).catch((err) =>
    console.error('[Welcome Notification Error]:', err)
  )

  return {
    success: true,
    user,
  }
})
