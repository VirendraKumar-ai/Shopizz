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

  await db
    .delete(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, user.id)))

  return {
    success: true,
    message: 'Address deleted successfully',
  }
})
