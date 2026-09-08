import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { addresses } from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const {
    fullName,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country = 'India',
    type = 'HOME',
    isDefault = false,
  } = body

  if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide all required address fields',
    })
  }

  // If set as default, reset other addresses for this user
  if (isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(addresses.userId, user.id))
  }

  // Check if this is the first address, if so make it default
  const existing = await db
    .select({ id: addresses.id })
    .from(addresses)
    .where(eq(addresses.userId, user.id))
    .limit(1)

  const makeDefault = isDefault || existing.length === 0

  const [created] = await db
    .insert(addresses)
    .values({
      userId: user.id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2?.trim() || null,
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country,
      type: type || 'HOME',
      isDefault: makeDefault,
    })
    .returning()

  return {
    success: true,
    address: created,
  }
})
