import { desc, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  wishlists,
  products,
  productImages,
  categories,
  users,
} from '~~/db/schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const rows = await db
    .select({
      id: wishlists.id,
      productId: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      isFeatured: products.isFeatured,
      createdAt: wishlists.createdAt,
      imageUrl: productImages.url,
      categoryName: categories.name,
      shopName: users.name,
    })
    .from(wishlists)
    .innerJoin(products, eq(wishlists.productId, products.id))
    .leftJoin(productImages, eq(products.id, productImages.productId))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(users, eq(products.ownerId, users.id))
    .where(eq(wishlists.userId, user.id))
    .orderBy(desc(wishlists.createdAt))

  // Deduplicate products in case of multiple images
  const itemMap = new Map<string, any>()
  for (const r of rows) {
    if (!itemMap.has(r.productId)) {
      itemMap.set(r.productId, {
        id: r.id,
        productId: r.productId,
        name: r.name,
        slug: r.slug,
        description: r.description,
        price: r.price,
        compareAtPrice: r.compareAtPrice,
        isFeatured: r.isFeatured,
        imageUrl: r.imageUrl || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80',
        categoryName: r.categoryName || 'Lifestyle',
        shopName: r.shopName || 'The Studio',
        createdAt: r.createdAt,
      })
    }
  }

  return {
    success: true,
    items: Array.from(itemMap.values()),
  }
})
