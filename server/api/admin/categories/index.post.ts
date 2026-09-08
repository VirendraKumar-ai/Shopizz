import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { categories } from '~~/db/schema'

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)

  const name = body.name ? String(body.name).trim() : ''
  let slug = body.slug ? String(body.slug).trim().toLowerCase() : ''
  const description = body.description ? String(body.description).trim() : null
  const imageUrl = body.imageUrl ? String(body.imageUrl).trim() : null
  const status = body.status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE'
  const sortOrder = typeof body.sortOrder === 'number' ? body.sortOrder : 0

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category name is required',
    })
  }

  if (!slug) {
    slug = slugify(name)
  }

  // Check unique slug
  const existingCategory = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  })

  if (existingCategory) {
    throw createError({
      statusCode: 409,
      statusMessage: `A category with slug "${slug}" already exists.`,
    })
  }

  const [createdCategory] = await db
    .insert(categories)
    .values({
      name,
      slug,
      description,
      imageUrl,
      status,
      sortOrder,
    })
    .returning()

  return {
    success: true,
    category: createdCategory,
  }
})
