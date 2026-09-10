import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { reviews, products, orders, orderItems } from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const {
    productId,
    rating,
    title,
    comment,
  } = body

  if (!productId || !rating || !comment) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID, rating (1-5), and review text are required',
    })
  }

  const numRating = Number(rating)
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Rating must be an integer between 1 and 5',
    })
  }

  // Verify if product exists
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

  // Check if buyer has ordered this item (verified purchase)
  const buyerOrders = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(eq(orders.buyerId, user.id), eq(orderItems.productId, productId)))
    .limit(1)

  const isVerifiedPurchase = buyerOrders.length > 0

  const [createdReview] = await db
    .insert(reviews)
    .values({
      productId,
      userId: user.id,
      rating: numRating,
      title: title?.trim() || null,
      comment: comment.trim(),
      isVerifiedPurchase,
      status: 'PUBLISHED',
    })
    .returning()

  return {
    success: true,
    review: createdReview,
  }
})
