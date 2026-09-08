import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { wishlists } from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Wishlist Item ID or Product ID is required',
    })
  }

  // Support removing by wishlist ID or by product ID
  await db
    .delete(wishlists)
    .where(
      and(
        eq(wishlists.userId, user.id),
        eq(wishlists.productId, id)
      )
    )

  await db
    .delete(wishlists)
    .where(
      and(
        eq(wishlists.userId, user.id),
        eq(wishlists.id, id)
      )
    )

  return {
    success: true,
    message: 'Removed from saved items',
  }
})
