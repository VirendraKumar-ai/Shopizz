import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { products } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const productId = getRouterParam(event, 'id')
  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required',
    })
  }

  const body = await readBody(event)
  const { status, isFeatured } = body

  // Check existing product
  const existing = await db.query.products.findFirst({
    where: eq(products.id, productId),
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found',
    })
  }

  const updates: Record<string, any> = {
    updatedAt: new Date(),
  }

  if (status !== undefined) {
    const validStatuses = ['DRAFT', 'ACTIVE', 'ARCHIVED']
    if (!validStatuses.includes(status)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      })
    }
    updates.status = status
  }

  if (isFeatured !== undefined) {
    updates.isFeatured = Boolean(isFeatured)
  }

  const [updated] = await db
    .update(products)
    .set(updates)
    .where(eq(products.id, productId))
    .returning()

  return {
    success: true,
    message: 'Product updated successfully',
    product: updated,
  }
})
