import { and, asc, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  products,
  productImages,
  inventory,
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)
  const productId = getRouterParam(event, 'id')

  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required',
    })
  }

  const existingProduct = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.ownerId, user.id)),
  })

  if (!existingProduct) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found or access denied',
    })
  }

  // 1. Fetch inventory
  const inv = await db.query.inventory.findFirst({
    where: eq(inventory.productId, productId),
  })

  // 2. Fetch images sorted by sortOrder
  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(asc(productImages.sortOrder))

  const primaryImage = images.find((i) => i.isPrimary) || images[0]

  return {
    success: true,
    product: {
      ...existingProduct,
      stock: inv?.quantity ?? 0,
      imageUrl: primaryImage?.url || null,
      images: images.map((img) => ({
        id: img.id,
        url: img.url,
        publicId: img.publicId,
        alt: img.alt,
        sortOrder: img.sortOrder,
        isPrimary: img.isPrimary,
      })),
    },
  }
})
