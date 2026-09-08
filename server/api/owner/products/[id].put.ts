import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  categories,
  products,
  productImages,
  inventory,
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)
  const productId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required',
    })
  }

  // 1. Verify ownership
  const existingProduct = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.ownerId, user.id)),
  })

  if (!existingProduct) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found or access denied',
    })
  }

  const {
    name,
    slug,
    categoryId,
    sku,
    shortDescription,
    description,
    price,
    compareAtPrice,
    costPrice,
    colors,
    sizes,
    details,
    status,
    isFeatured,
    imageUrl,
    stock,
  } = body

  // Validate category if provided and changed
  if (categoryId) {
    const validCategory = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    })

    if (!validCategory || validCategory.status !== 'ACTIVE') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Selected department/category is invalid or archived.',
      })
    }
  }

  // 2. Update product
  const [updatedProduct] = await db
    .update(products)
    .set({
      name: name ? String(name).trim() : existingProduct.name,
      slug: slug ? String(slug).trim().toLowerCase() : existingProduct.slug,
      categoryId: categoryId !== undefined ? (categoryId || null) : existingProduct.categoryId,
      sku: sku ? String(sku).trim().toUpperCase() : existingProduct.sku,
      shortDescription: shortDescription !== undefined ? (shortDescription ? String(shortDescription).trim() : null) : existingProduct.shortDescription,
      description: description !== undefined ? (description ? String(description).trim() : null) : existingProduct.description,
      price: price !== undefined ? Number(price) : existingProduct.price,
      compareAtPrice: compareAtPrice !== undefined ? (compareAtPrice ? Number(compareAtPrice) : null) : existingProduct.compareAtPrice,
      costPrice: costPrice !== undefined ? Number(costPrice) : existingProduct.costPrice,
      colors: colors !== undefined ? colors : existingProduct.colors,
      sizes: sizes !== undefined ? sizes : existingProduct.sizes,
      details: details !== undefined ? details : existingProduct.details,
      status: status || existingProduct.status,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existingProduct.isFeatured,
      updatedAt: new Date(),
    })
    .where(and(eq(products.id, productId), eq(products.ownerId, user.id)))
    .returning()

  // 3. Update images (supports multi-image array with fallback to single imageUrl)
  if (Array.isArray(body.images)) {
    // Delete existing images for this product to replace with updated order/selection
    await db.delete(productImages).where(eq(productImages.productId, productId))

    if (body.images.length > 0) {
      const hasPrimary = body.images.some((img: any) => img.isPrimary)
      const imageInserts = body.images.map((img: any, index: number) => ({
        productId,
        url: String(img.url).trim(),
        publicId: img.publicId ? String(img.publicId).trim() : null,
        alt: img.alt ? String(img.alt).trim() : updatedProduct.name,
        sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : index,
        isPrimary: hasPrimary ? Boolean(img.isPrimary) : index === 0,
      }))

      await db.insert(productImages).values(imageInserts)
    }
  } else if (imageUrl) {
    const existingImage = await db.query.productImages.findFirst({
      where: eq(productImages.productId, productId),
    })

    if (existingImage) {
      await db
        .update(productImages)
        .set({
          url: String(imageUrl).trim(),
          publicId: body.publicId !== undefined ? (body.publicId ? String(body.publicId).trim() : null) : existingImage.publicId,
          alt: updatedProduct.name,
        })
        .where(eq(productImages.id, existingImage.id))
    } else {
      await db.insert(productImages).values({
        productId,
        url: String(imageUrl).trim(),
        publicId: body.publicId ? String(body.publicId).trim() : null,
        alt: updatedProduct.name,
        sortOrder: 0,
        isPrimary: true,
      })
    }
  }

  // 4. Update inventory
  if (stock !== undefined) {
    const existingInventory = await db.query.inventory.findFirst({
      where: eq(inventory.productId, productId),
    })

    if (existingInventory) {
      await db
        .update(inventory)
        .set({
          quantity: Number(stock) || 0,
          updatedAt: new Date(),
        })
        .where(eq(inventory.id, existingInventory.id))
    } else {
      await db.insert(inventory).values({
        productId,
        quantity: Number(stock) || 0,
        reservedQuantity: 0,
      })
    }
  }

  return {
    success: true,
    product: updatedProduct,
  }
})
