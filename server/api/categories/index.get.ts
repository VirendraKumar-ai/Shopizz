import { asc, eq, sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { categories, products } from '~~/db/schema'

export default defineEventHandler(async () => {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      imageUrl: categories.imageUrl,
      status: categories.status,
      sortOrder: categories.sortOrder,
      productCount: sql<number>`count(${products.id}) filter (where ${products.status} = 'ACTIVE')`.mapWith(Number),
    })
    .from(categories)
    .leftJoin(products, eq(categories.id, products.categoryId))
    .where(eq(categories.status, 'ACTIVE'))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name))

  return {
    success: true,
    categories: rows,
  }
})
