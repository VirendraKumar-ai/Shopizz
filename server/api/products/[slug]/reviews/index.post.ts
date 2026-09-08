import { and, eq, sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import { createNotification } from '~~/server/utils/notifications'
import {
  products,
  reviews,
  orders,
  orderItems
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product slug is required'
    })
  }

  const body = await readBody(event)
  const rating = Number(body?.rating)
  const title = body?.title ? String(body.title).trim() : null
  const comment = body?.comment ? String(body.comment).trim() : ''

  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Rating must be an integer between 1 and 5'
    })
  }

  if (!comment || comment.length < 3) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide a review comment with at least 3 characters'
    })
  }

  // 1. Find product
  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      ownerId: products.ownerId
    })
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1)

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found'
    })
  }

  // 2. Check if verified purchaser
  const orderCheck = await db
    .select({ id: orders.id })
    .from(orders)
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(
      and(
        eq(orders.buyerId, user.id),
        eq(orderItems.productId, product.id)
      )
    )
    .limit(1)

  const isVerifiedPurchase = orderCheck.length > 0

  // 3. Check if user already reviewed this product
  const [existingReview] = await db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.productId, product.id),
        eq(reviews.userId, user.id)
      )
    )
    .limit(1)

  let savedReview = null

  if (existingReview) {
    const [updated] = await db
      .update(reviews)
      .set({
        rating,
        title,
        comment,
        isVerifiedPurchase: isVerifiedPurchase || existingReview.isVerifiedPurchase,
        updatedAt: new Date()
      })
      .where(eq(reviews.id, existingReview.id))
      .returning()

    savedReview = updated
  } else {
    const [inserted] = await db
      .insert(reviews)
      .values({
        productId: product.id,
        userId: user.id,
        rating,
        title,
        comment,
        isVerifiedPurchase,
        status: 'PUBLISHED'
      })
      .returning()

    savedReview = inserted
  }

  // 4. Recalculate average rating & review count on products table
  const aggResult = await db.execute(sql`
    SELECT 
      COUNT(id) as total_count,
      AVG(rating) as avg_rating
    FROM reviews 
    WHERE product_id = ${product.id} AND status = 'PUBLISHED'
  `)

  const totalCount = Number(aggResult.rows?.[0]?.total_count ?? (aggResult as any)[0]?.total_count ?? 1)
  const avgRating = Number(aggResult.rows?.[0]?.avg_rating ?? (aggResult as any)[0]?.avg_rating ?? rating)

  const roundedRating = Math.round(avgRating * 10) / 10

  await db
    .update(products)
    .set({
      rating: roundedRating,
      reviewCount: totalCount,
      updatedAt: new Date()
    })
    .where(eq(products.id, product.id))

  // 5. Trigger notification to shop owner if reviewer is not the owner
  if (product.ownerId && product.ownerId !== user.id) {
    await createNotification({
      userId: product.ownerId,
      type: 'NEW_REVIEW',
      title: 'New Customer Review',
      message: `${user.name || 'A customer'} left a ${rating}★ review on "${product.name}".`,
      link: '/owner/reviews'
    })
  }

  return {
    success: true,
    review: savedReview,
    updatedStats: {
      rating: roundedRating,
      reviewCount: totalCount
    }
  }
})
