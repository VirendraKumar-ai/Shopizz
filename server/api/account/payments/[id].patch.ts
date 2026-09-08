import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { paymentMethods } from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Payment Method ID is required',
    })
  }

  const body = await readBody(event)
  const { isDefault } = body

  if (isDefault) {
    await db
      .update(paymentMethods)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(paymentMethods.userId, user.id))

    const [updated] = await db
      .update(paymentMethods)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, user.id)))
      .returning()

    return {
      success: true,
      paymentMethod: updated,
    }
  }

  return {
    success: true,
  }
})
