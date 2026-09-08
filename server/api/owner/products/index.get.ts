import { desc, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  products,
  categories,
  productImages,
  inventory,
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
      shortDescription: products.shortDescription,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      costPrice: products.costPrice,
      status: products.status,
      isFeatured: products.isFeatured,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,

      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      },

      imageUrl: productImages.url,
      stock: inventory.quantity,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(productImages, eq(products.id, productImages.productId))
    .leftJoin(inventory, eq(products.id, inventory.productId))
    .where(eq(products.ownerId, user.id))
    .orderBy(desc(products.createdAt))

  // Group by product id
  const productMap = new Map<string, any>()
  for (const r of rows) {
    if (!productMap.has(r.id)) {
      productMap.set(r.id, {
        id: r.id,
        name: r.name,
        slug: r.slug,
        sku: r.sku,
        shortDescription: r.shortDescription,
        price: r.price,
        compareAtPrice: r.compareAtPrice,
        costPrice: r.costPrice,
        status: r.status,
        isFeatured: r.isFeatured,
        category: r.category,
        stock: r.stock ?? 0,
        imageUrl: r.imageUrl,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })
    }
  }

  return {
    success: true,
    products: Array.from(productMap.values()),
  }
})
