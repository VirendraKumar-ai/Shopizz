import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { products, inventory } from '~~/db/schema'
import { requireOwner } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required',
    })
  }

  // Check ownership
  const [prod] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.id, id), eq(products.ownerId, user.id)))
    .limit(1)

  if (!prod) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found or unauthorized',
    })
  }

  const body = await readBody(event)
  const { quantity, delta } = body

  let targetQuantity: number

  if (quantity !== undefined) {
    targetQuantity = Math.max(0, Number(quantity))
  } else if (delta !== undefined) {
    const [currInv] = await db
      .select({ quantity: inventory.quantity })
      .from(inventory)
      .where(eq(inventory.productId, id))
      .limit(1)

    const currentQty = currInv?.quantity || 0
    targetQuantity = Math.max(0, currentQty + Number(delta))
  } else {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide quantity or delta adjustment',
    })
  }

  // Update or insert inventory
  const [existingInv] = await db
    .select({ id: inventory.id })
    .from(inventory)
    .where(eq(inventory.productId, id))
    .limit(1)

  if (existingInv) {
    await db
      .update(inventory)
      .set({
        quantity: targetQuantity,
        updatedAt: new Date(),
      })
      .where(eq(inventory.productId, id))
  } else {
    await db
      .insert(inventory)
      .values({
        productId: id,
        quantity: targetQuantity,
      })
  }

  return {
    success: true,
    productId: id,
    newQuantity: targetQuantity,
  }
})
