import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  products,
  reviews,
  users,
  orders,
  orderItems
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product slug is required'
    })
  }

  // 1. Find product
  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      ownerId: products.ownerId,
      rating: products.rating,
      reviewCount: products.reviewCount
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

  // 2. Fetch published reviews
  const reviewRows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      comment: reviews.comment,
      isVerifiedPurchase: reviews.isVerifiedPurchase,
      sellerReply: reviews.sellerReply,
      sellerRepliedAt: reviews.sellerRepliedAt,
      createdAt: reviews.createdAt,
      user: {
        id: users.id,
        name: users.name,
        role: users.role
      }
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(
      and(
        eq(reviews.productId, product.id),
        eq(reviews.status, 'PUBLISHED')
      )
    )
    .orderBy(desc(reviews.createdAt))

  // 3. Calculate rating distribution & aggregates
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let sum = 0

  reviewRows.forEach(r => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)))
    distribution[star] = (distribution[star] || 0) + 1
    sum += r.rating
  })

  const totalReviews = reviewRows.length
  const averageRating = totalReviews > 0 ? Math.round((sum / totalReviews) * 10) / 10 : 5.0

  // 4. Session info & eligibility
  let canReview = false
  let isVerified = false
  let hasReviewed = false
  let userReview = null

  try {
    const session = await getUserSession(event)
    if (session?.user?.id) {
      const currentUserId = session.user.id
      canReview = true

      // Check if already reviewed
      const existingUserReview = reviewRows.find(r => r.user.id === currentUserId)
      if (existingUserReview) {
        hasReviewed = true
        userReview = existingUserReview
      }

      // Check if user purchased this product
      const purchasedRows = await db
        .select({ id: orders.id })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .where(
          and(
            eq(orders.buyerId, currentUserId),
            eq(orderItems.productId, product.id)
          )
        )
        .limit(1)

      if (purchasedRows.length > 0) {
        isVerified = true
      }
    }
  } catch {
    // Guest user
  }

  return {
    productId: product.id,
    stats: {
      averageRating,
      totalReviews,
      distribution,
      percentages: {
        5: totalReviews > 0 ? Math.round((distribution[5] / totalReviews) * 100) : 0,
        4: totalReviews > 0 ? Math.round((distribution[4] / totalReviews) * 100) : 0,
        3: totalReviews > 0 ? Math.round((distribution[3] / totalReviews) * 100) : 0,
        2: totalReviews > 0 ? Math.round((distribution[2] / totalReviews) * 100) : 0,
        1: totalReviews > 0 ? Math.round((distribution[1] / totalReviews) * 100) : 0
      }
    },
    reviews: reviewRows.map(r => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isVerifiedPurchase: r.isVerifiedPurchase,
      sellerReply: r.sellerReply,
      sellerRepliedAt: r.sellerRepliedAt,
      createdAt: r.createdAt,
      author: {
        name: r.user.name,
        initial: r.user.name?.charAt(0).toUpperCase() || 'U',
        isOwner: r.user.role === 'OWNER'
      }
    })),
    userState: {
      canReview,
      isVerified,
      hasReviewed,
      userReview
    }
  }
})
