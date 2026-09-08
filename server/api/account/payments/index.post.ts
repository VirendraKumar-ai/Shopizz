import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { paymentMethods } from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const {
    type = 'CARD',
    provider,
    identifier,
    holderName,
    expiryMonth,
    expiryYear,
    isDefault = false,
  } = body

  if (!provider || !identifier) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Provider and identifier (card number/UPI ID) are required',
    })
  }

  // If set as default, reset other payment methods
  if (isDefault) {
    await db
      .update(paymentMethods)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(paymentMethods.userId, user.id))
  }

  // Mask card number if type is CARD
  let maskedIdentifier = identifier.trim()
  if (type === 'CARD') {
    const rawDigits = identifier.replace(/\s+/g, '')
    const last4 = rawDigits.slice(-4)
    maskedIdentifier = `•••• •••• •••• ${last4}`
  }

  const existing = await db
    .select({ id: paymentMethods.id })
    .from(paymentMethods)
    .where(eq(paymentMethods.userId, user.id))
    .limit(1)

  const makeDefault = isDefault || existing.length === 0

  const [created] = await db
    .insert(paymentMethods)
    .values({
      userId: user.id,
      type: type as any,
      provider: provider.trim(),
      identifier: maskedIdentifier,
      holderName: holderName?.trim() || null,
      expiryMonth: expiryMonth?.trim() || null,
      expiryYear: expiryYear?.trim() || null,
      isDefault: makeDefault,
    })
    .returning()

  return {
    success: true,
    paymentMethod: created,
  }
})
