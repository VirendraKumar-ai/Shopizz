import { eq, and } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { requireOwner } from '~~/server/utils/auth'
import { createNotification } from '~~/server/utils/notifications'
import {
  reviews,
  products
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)
  const reviewId = getRouterParam(event, 'id')

  if (!reviewId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Review ID is required'
    })
  }

  const body = await readBody(event)
  const reply = body?.reply ? String(body.reply).trim() : ''

  if (!reply) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Reply message cannot be empty'
    })
  }

  // 1. Find review and verify ownership of the product
  const [review] = await db
    .select({
      id: reviews.id,
      userId: reviews.userId,
      productId: reviews.productId,
      productName: products.name,
      productSlug: products.slug,
      productOwnerId: products.ownerId
    })
    .from(reviews)
    .innerJoin(products, eq(reviews.productId, products.id))
    .where(eq(reviews.id, reviewId))
    .limit(1)

  if (!review) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Review not found'
    })
  }

  if (review.productOwnerId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You can only reply to reviews on your own products'
    })
  }

  // 2. Update review with reply
  const [updated] = await db
    .update(reviews)
    .set({
      sellerReply: reply,
      sellerRepliedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(reviews.id, reviewId))
    .returning()

  // 3. Notify the reviewer
  if (review.userId) {
    await createNotification({
      userId: review.userId,
      type: 'SELLER_REPLY',
      title: 'Studio Response to Your Review',
      message: `The studio replied to your review on "${review.productName}".`,
      link: `/product/${review.productSlug}`
    })
  }

  return {
    success: true,
    review: updated
  }
})
