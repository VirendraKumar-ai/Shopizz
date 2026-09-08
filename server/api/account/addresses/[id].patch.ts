import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { addresses } from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Address ID is required',
    })
  }

  const body = await readBody(event)
  const {
    fullName,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    type,
    isDefault,
  } = body

  // Check ownership
  const [existing] = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, user.id)))
    .limit(1)

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Address not found',
    })
  }

  if (isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(addresses.userId, user.id))
  }

  const updateData: any = { updatedAt: new Date() }
  if (fullName !== undefined) updateData.fullName = fullName.trim()
  if (phone !== undefined) updateData.phone = phone.trim()
  if (addressLine1 !== undefined) updateData.addressLine1 = addressLine1.trim()
  if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2?.trim() || null
  if (city !== undefined) updateData.city = city.trim()
  if (state !== undefined) updateData.state = state.trim()
  if (postalCode !== undefined) updateData.postalCode = postalCode.trim()
  if (country !== undefined) updateData.country = country
  if (type !== undefined) updateData.type = type
  if (isDefault !== undefined) updateData.isDefault = isDefault

  const [updated] = await db
    .update(addresses)
    .set(updateData)
    .where(and(eq(addresses.id, id), eq(addresses.userId, user.id)))
    .returning()

  return {
    success: true,
    address: updated,
  }
})
