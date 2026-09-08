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

  await db
    .delete(paymentMethods)
    .where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, user.id)))

  return {
    success: true,
    message: 'Payment method removed',
  }
})
