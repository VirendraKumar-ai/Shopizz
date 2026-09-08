import { eq, sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { reviews, products } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const reviewId = getRouterParam(event, 'id')

  if (!reviewId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Review ID is required'
    })
  }

  const body = await readBody(event)
  const status = body?.status === 'HIDDEN' ? 'HIDDEN' : 'PUBLISHED'

  const [review] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, reviewId))
    .limit(1)

  if (!review) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Review not found'
    })
  }

  const [updated] = await db
    .update(reviews)
    .set({
      status,
      updatedAt: new Date()
    })
    .where(eq(reviews.id, reviewId))
    .returning()

  // Recalculate product rating & count for this product
  const aggResult = await db.execute(sql`
    SELECT 
      COUNT(id) as total_count,
      COALESCE(AVG(rating), 5.0) as avg_rating
    FROM reviews 
    WHERE product_id = ${review.productId} AND status = 'PUBLISHED'
  `)

  const totalCount = Number(aggResult.rows?.[0]?.total_count ?? (aggResult as any)[0]?.total_count ?? 0)
  const avgRating = Number(aggResult.rows?.[0]?.avg_rating ?? (aggResult as any)[0]?.avg_rating ?? 5.0)

  await db
    .update(products)
    .set({
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: totalCount,
      updatedAt: new Date()
    })
    .where(eq(products.id, review.productId))

  return {
    success: true,
    review: updated
  }
})
