import { and, asc, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  products,
  categories,
  productImages,
  inventory,
  users,
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const categorySlug = query.category ? String(query.category).trim() : null

  const conditions = [eq(products.status, 'ACTIVE')]
  if (categorySlug) {
    conditions.push(eq(categories.slug, categorySlug))
  }

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
      shortDescription: products.shortDescription,
      description: products.description,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      status: products.status,
      isFeatured: products.isFeatured,

      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      },

      image: {
        url: productImages.url,
        alt: productImages.alt,
        isPrimary: productImages.isPrimary,
        sortOrder: productImages.sortOrder,
      },

      stock: inventory.quantity,

      owner: {
        id: users.id,
        name: users.name,
      },
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(productImages, eq(products.id, productImages.productId))
    .leftJoin(inventory, eq(products.id, inventory.productId))
    .innerJoin(users, eq(products.ownerId, users.id))
    .where(and(...conditions))
    .orderBy(asc(products.createdAt))

  const productMap = new Map<string, any>()

  for (const row of rows) {
    if (!productMap.has(row.id)) {
      productMap.set(row.id, {
        id: row.id,
        name: row.name,
        slug: row.slug,
        sku: row.sku,
        shortDescription: row.shortDescription,
        description: row.description,
        price: row.price,
        compareAtPrice: row.compareAtPrice,
        status: row.status,
        isFeatured: row.isFeatured,
        category: row.category,
        stock: row.stock ?? 0,
        owner: row.owner,
        images: [],
      })
    }

    const product = productMap.get(row.id)

    if (row.image?.url) {
      product.images.push({
        url: row.image.url,
        alt: row.image.alt || row.name,
        isPrimary: row.image.isPrimary,
        sortOrder: row.image.sortOrder,
      })
    }
  }

  // Sort images per product
  for (const product of productMap.values()) {
    product.images.sort((a: any, b: any) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  }

  return {
    success: true,
    products: Array.from(productMap.values()),
  }
})