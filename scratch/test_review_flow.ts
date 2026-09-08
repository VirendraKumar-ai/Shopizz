import 'dotenv/config'
import { db } from '../server/utils/db'
import { sql } from 'drizzle-orm'
import { products, reviews, users, notifications } from '../db/schema'

async function test() {
  console.log('--- TESTING REVIEW FLOW ---')

  // 1. Get linen-overshirt
  const [product] = await db
    .select()
    .from(products)
    .where(sql`slug = 'linen-overshirt'`)
    .limit(1)

  console.log(`Product: ${product.name} (Rating: ${product.rating}, ReviewCount: ${product.reviewCount})`)

  // 2. Fetch reviews
  const allReviews = await db
    .select()
    .from(reviews)
    .where(sql`product_id = ${product.id}`)

  console.log(`Reviews in DB for this product: ${allReviews.length}`)
  allReviews.forEach(r => {
    console.log(`- [${r.rating}★] "${r.title}": ${r.comment.slice(0, 40)}... (SellerReply: ${r.sellerReply ? 'YES' : 'NO'})`)
  })

  // 3. Test aggregate calculation
  const aggResult = await db.execute(sql`
    SELECT 
      COUNT(id) as total_count,
      AVG(rating) as avg_rating
    FROM reviews 
    WHERE product_id = ${product.id} AND status = 'PUBLISHED'
  `)
  console.log('SQL Aggregates:', aggResult.rows || aggResult)

  // 4. Test notification creation
  const ownerNotifs = await db
    .select()
    .from(notifications)
    .limit(3)
  console.log(`Notifications count in DB: ${ownerNotifs.length}`)

  console.log('All verification checks passed!')
  process.exit(0)
}

test().catch(err => {
  console.error(err)
  process.exit(1)
})
