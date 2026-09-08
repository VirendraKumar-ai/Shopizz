import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { users, emailVerifications } from '~~/db/schema'
import { sendOtpSchema } from '~~/shared/schemas/auth'
import { sendOtpEmail } from '~~/server/utils/mailer'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = sendOtpSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid registration details',
      data: result.error.flatten(),
    })
  }

  const { name, email, password } = result.data

  // 1. Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'An account with this email already exists',
    })
  }

  // 2. Generate 6-digit OTP and expiration (10 minutes)
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
  const passwordHash = await hashPassword(password)

  // 3. Clear old pending verifications for this email
  await db.delete(emailVerifications).where(eq(emailVerifications.email, email))

  // 4. Save verification record
  await db.insert(emailVerifications).values({
    email,
    otp,
    name,
    passwordHash,
    expiresAt,
    isVerified: false,
  })

  // 5. Send OTP Email
  const mailResult = await sendOtpEmail(email, name, otp)
  if (!mailResult.success) {
    console.warn(`[OTP] Email failed to send, but record created. Error: ${mailResult.error}`)
  }

  return {
    success: true,
    message: 'Verification code sent to your email',
    email,
  }
})
