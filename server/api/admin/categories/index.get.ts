import { asc, eq, sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { categories, products } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      imageUrl: categories.imageUrl,
      status: categories.status,
      sortOrder: categories.sortOrder,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
      productCount: sql<number>`count(${products.id})`.mapWith(Number),
    })
    .from(categories)
    .leftJoin(products, eq(categories.id, products.categoryId))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name))

  return {
    success: true,
    categories: rows,
  }
})
