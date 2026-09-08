import { and, eq, ne } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { categories } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const categoryId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!categoryId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category ID is required',
    })
  }

  const existingCategory = await db.query.categories.findFirst({
    where: eq(categories.id, categoryId),
  })

  if (!existingCategory) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Category not found',
    })
  }

  const {
    name,
    slug,
    description,
    imageUrl,
    status,
    sortOrder,
  } = body

  // Check unique slug if slug is updated
  if (slug && slug.trim().toLowerCase() !== existingCategory.slug) {
    const slugConflict = await db.query.categories.findFirst({
      where: and(
        eq(categories.slug, slug.trim().toLowerCase()),
        ne(categories.id, categoryId)
      ),
    })

    if (slugConflict) {
      throw createError({
        statusCode: 409,
        statusMessage: `A category with slug "${slug}" already exists.`,
      })
    }
  }

  const [updatedCategory] = await db
    .update(categories)
    .set({
      name: name !== undefined ? String(name).trim() : existingCategory.name,
      slug: slug !== undefined ? String(slug).trim().toLowerCase() : existingCategory.slug,
      description: description !== undefined ? (description ? String(description).trim() : null) : existingCategory.description,
      imageUrl: imageUrl !== undefined ? (imageUrl ? String(imageUrl).trim() : null) : existingCategory.imageUrl,
      status: status !== undefined ? (status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE') : existingCategory.status,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : existingCategory.sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, categoryId))
    .returning()

  return {
    success: true,
    category: updatedCategory,
  }
})
