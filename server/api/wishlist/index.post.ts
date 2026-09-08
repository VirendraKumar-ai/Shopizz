import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { wishlists, products } from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const { productId } = body

  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required',
    })
  }

  // Check product exists
  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1)

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found',
    })
  }

  // Check if already in wishlist -> if so, remove (toggle); if not, insert
  const [existing] = await db
    .select()
    .from(wishlists)
    .where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)))
    .limit(1)

  if (existing) {
    await db
      .delete(wishlists)
      .where(eq(wishlists.id, existing.id))

    return {
      success: true,
      action: 'REMOVED',
      isSaved: false,
    }
  }

  const [created] = await db
    .insert(wishlists)
    .values({
      userId: user.id,
      productId,
    })
    .returning()

  return {
    success: true,
    action: 'ADDED',
    isSaved: true,
    item: created,
  }
})
