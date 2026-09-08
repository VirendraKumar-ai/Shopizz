import { desc, eq, and, sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { requireOwner } from '~~/server/utils/auth'
import {
  products,
  reviews,
  users,
  productImages
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)

  // 1. Fetch reviews on owner's products
  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      comment: reviews.comment,
      isVerifiedPurchase: reviews.isVerifiedPurchase,
      sellerReply: reviews.sellerReply,
      sellerRepliedAt: reviews.sellerRepliedAt,
      status: reviews.status,
      createdAt: reviews.createdAt,
      product: {
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price
      },
      reviewer: {
        id: users.id,
        name: users.name,
        email: users.email
      }
    })
    .from(reviews)
    .innerJoin(products, eq(reviews.productId, products.id))
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(products.ownerId, user.id))
    .orderBy(desc(reviews.createdAt))

  // 2. Fetch primary images for these products
  const productIds = Array.from(new Set(rows.map(r => r.product.id)))
  const imagesMap: Record<string, string> = {}

  if (productIds.length > 0) {
    const images = await db
      .select({
        productId: productImages.productId,
        url: productImages.url
      })
      .from(productImages)
      .where(eq(productImages.isPrimary, true))

    images.forEach(img => {
      imagesMap[img.productId] = img.url
    })
  }

  // 3. Calculate summary metrics
  const totalReviews = rows.length
  const pendingReplies = rows.filter(r => !r.sellerReply).length
  const avgRating = totalReviews > 0
    ? Math.round((rows.reduce((acc, r) => acc + r.rating, 0) / totalReviews) * 10) / 10
    : 0

  return {
    metrics: {
      totalReviews,
      avgRating,
      pendingReplies
    },
    reviews: rows.map(r => ({
      ...r,
      product: {
        ...r.product,
        imageUrl: imagesMap[r.product.id] || null
      }
    }))
  }
})
