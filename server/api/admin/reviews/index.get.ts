import { desc, eq, and, ilike, or } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import {
  products,
  reviews,
  users,
  productImages
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const statusFilter = query.status ? String(query.status) : undefined
  const search = query.search ? String(query.search).trim() : ''

  // 1. Fetch all marketplace reviews
  const baseQuery = db
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
        slug: products.slug
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
    .orderBy(desc(reviews.createdAt))

  const rows = await baseQuery

  // Filter in memory for simplicity or add where conditions
  let filtered = rows
  if (statusFilter && statusFilter !== 'ALL') {
    filtered = filtered.filter(r => r.status === statusFilter)
  }
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(r => 
      r.product.name.toLowerCase().includes(s) ||
      r.reviewer.name.toLowerCase().includes(s) ||
      r.reviewer.email.toLowerCase().includes(s) ||
      (r.title && r.title.toLowerCase().includes(s)) ||
      r.comment.toLowerCase().includes(s)
    )
  }

  // Summary counts
  const total = rows.length
  const publishedCount = rows.filter(r => r.status === 'PUBLISHED').length
  const hiddenCount = rows.filter(r => r.status === 'HIDDEN').length

  return {
    metrics: {
      total,
      publishedCount,
      hiddenCount
    },
    reviews: filtered
  }
})
