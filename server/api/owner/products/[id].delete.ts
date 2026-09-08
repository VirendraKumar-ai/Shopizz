import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { products } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)
  const productId = getRouterParam(event, 'id')

  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required',
    })
  }

  const existingProduct = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.ownerId, user.id)),
  })

  if (!existingProduct) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found or access denied',
    })
  }

  // Soft-archive product to protect historic order reference integrity
  await db
    .update(products)
    .set({
      status: 'ARCHIVED',
      updatedAt: new Date(),
    })
    .where(and(eq(products.id, productId), eq(products.ownerId, user.id)))

  return {
    success: true,
    message: 'Product archived successfully',
  }
})
