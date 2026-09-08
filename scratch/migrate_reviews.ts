import 'dotenv/config'
import { db } from '../server/utils/db'
import { sql } from 'drizzle-orm'
import { users, products } from '../db/schema'

async function run() {
  console.log('Creating reviews table in PostgreSQL if not exists...')

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE review_status AS ENUM ('PUBLISHED', 'HIDDEN');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      title TEXT,
      comment TEXT NOT NULL,
      is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
      seller_reply TEXT,
      seller_replied_at TIMESTAMPTZ,
      status review_status NOT NULL DEFAULT 'PUBLISHED',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  console.log('Table reviews ready. Checking existing users and products...')

  const allUsers = await db.select().from(users)
  const allProducts = await db.select().from(products)

  console.log(`Found ${allUsers.length} users and ${allProducts.length} products.`)

  if (allUsers.length === 0 || allProducts.length === 0) {
    console.log('No users or products found, skipping seed.')
    process.exit(0)
  }

  // Find linen-overshirt or first product
  const linenShirt = allProducts.find(p => p.slug === 'linen-overshirt') || allProducts[0]
  const buyerUser = allUsers.find(u => u.role === 'BUYER') || allUsers[0]
  const adminUser = allUsers.find(u => u.role === 'ADMIN') || allUsers[0]
  const ownerUser = allUsers.find(u => u.role === 'OWNER') || allUsers[0]

  // Seed sample reviews for linen-overshirt if no reviews exist for it
  const existingReviews = await db.execute(sql`
    SELECT count(*) as count FROM reviews WHERE product_id = ${linenShirt.id}
  `)
  const count = Number(existingReviews.rows?.[0]?.count ?? (existingReviews as any)[0]?.count ?? 0)

  if (count === 0) {
    console.log(`Seeding reviews for product: ${linenShirt.name} (${linenShirt.slug})...`)

    const sampleReviews = [
      {
        productId: linenShirt.id,
        userId: buyerUser.id,
        rating: 5,
        title: 'Exceptional drape and craftsmanship',
        comment: 'The weight of the raw French linen is remarkable. It sits cleanly on the shoulders without feeling stiff. Wore it throughout a warm weekend in Lisbon and received multiple compliments.',
        isVerifiedPurchase: true,
        sellerReply: 'Thank you so much! We spend months sourcing our organic flax fibers directly from Normandy to ensure that exact breathability and hand-feel.',
        sellerRepliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 days ago
      },
      {
        productId: linenShirt.id,
        userId: adminUser.id,
        rating: 5,
        title: 'Worth every penny. Minimalist perfection.',
        comment: 'The coconut-shell button detailing and reinforced sleeve hems elevate this far beyond typical high-street shirts. Sizing is spot on relaxed-true-to-size.',
        isVerifiedPurchase: true,
        sellerReply: null,
        sellerRepliedAt: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12)
      },
      {
        productId: linenShirt.id,
        userId: ownerUser.id,
        rating: 4,
        title: 'Beautiful texture, slightly oversized sleeve',
        comment: 'Love the artisanal texture and the unbleached oat tone. The sleeves run a touch long, but cuffing them gives a wonderfully casual studio look.',
        isVerifiedPurchase: true,
        sellerReply: 'Appreciate the thoughtful feedback! We deliberately cut the cuffs with extra length for rolled styling, but we are designing a tailored variant for next season!',
        sellerRepliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20)
      }
    ]

    for (const r of sampleReviews) {
      await db.execute(sql`
        INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase, seller_reply, seller_replied_at, created_at, updated_at)
        VALUES (${r.productId}, ${r.userId}, ${r.rating}, ${r.title}, ${r.comment}, ${r.isVerifiedPurchase}, ${r.sellerReply}, ${r.sellerRepliedAt?.toISOString() || null}, ${r.createdAt.toISOString()}, ${r.createdAt.toISOString()})
      `)
    }
    console.log('Sample reviews seeded successfully!')
  }

  // Also seed a couple reviews for other products if they have none
  for (const prod of allProducts.slice(1, 4)) {
    const prodReviewCheck = await db.execute(sql`
      SELECT count(*) as count FROM reviews WHERE product_id = ${prod.id}
    `)
    const pCount = Number(prodReviewCheck.rows?.[0]?.count ?? (prodReviewCheck as any)[0]?.count ?? 0)
    if (pCount === 0) {
      await db.execute(sql`
        INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase, created_at, updated_at)
        VALUES (${prod.id}, ${buyerUser.id}, 5, 'Stunning quality', 'Exceeded my expectations in person. Beautiful finish and fast studio packaging.', true, NOW(), NOW())
      `)
    }
  }

  // Recalculate average rating and review_count for all products that have reviews
  console.log('Recalculating ratings and review counts on products table...')
  for (const prod of allProducts) {
    const aggResult = await db.execute(sql`
      SELECT 
        COUNT(id) as total_count,
        COALESCE(AVG(rating), 4.8) as avg_rating
      FROM reviews 
      WHERE product_id = ${prod.id} AND status = 'PUBLISHED'
    `)
    const totalCount = Number(aggResult.rows?.[0]?.total_count ?? (aggResult as any)[0]?.total_count ?? 0)
    const avgRating = Number(aggResult.rows?.[0]?.avg_rating ?? (aggResult as any)[0]?.avg_rating ?? 4.8)

    if (totalCount > 0) {
      await db.execute(sql`
        UPDATE products
        SET rating = ${Math.round(avgRating * 10) / 10},
            review_count = ${totalCount}
        WHERE id = ${prod.id}
      `)
    }
  }

  console.log('All migrations and seedings completed successfully!')
  process.exit(0)
}

run().catch(err => {
  console.error('Migration error:', err)
  process.exit(1)
})
