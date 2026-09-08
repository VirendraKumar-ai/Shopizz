import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { emailVerifications } from '~~/db/schema'
import { resendOtpSchema } from '~~/shared/schemas/auth'
import { sendOtpEmail } from '~~/server/utils/mailer'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = resendOtpSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email address',
      data: result.error.flatten(),
    })
  }

  const { email } = result.data

  const record = await db.query.emailVerifications.findFirst({
    where: eq(emailVerifications.email, email),
  })

  if (!record) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Verification session expired. Please sign up again.',
    })
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await db
    .update(emailVerifications)
    .set({
      otp,
      expiresAt,
    })
    .where(eq(emailVerifications.email, email))

  const mailResult = await sendOtpEmail(email, record.name, otp)
  if (!mailResult.success) {
    console.warn(`[Resend OTP] Email failed to send: ${mailResult.error}`)
  }

  return {
    success: true,
    message: 'A new verification code has been sent to your email',
  }
})
