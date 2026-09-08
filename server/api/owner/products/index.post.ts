import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  categories,
  products,
  productImages,
  inventory,
} from '~~/db/schema'
import { createNotification } from '~~/server/utils/notifications'
import { sendProductPublishedEmail } from '~~/server/utils/mailer'


export default defineEventHandler(async (event) => {
  const user = await requireOwner(event)
  const body = await readBody(event)

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
    status = 'ACTIVE',
    isFeatured = false,
    imageUrl,
    stock = 0,
  } = body

  if (!name || !slug || !price || costPrice === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name, Slug, Price and Cost Price are required',
    })
  }

  // Check unique slug and sku
  const existingSlug = await db.query.products.findFirst({
    where: eq(products.slug, slug),
  })

  if (existingSlug) {
    throw createError({
      statusCode: 409,
      statusMessage: 'A product with this URL slug already exists. Please choose another.',
    })
  }

  // Validate category exists and is ACTIVE
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

  const generatedSku = sku || `SKU-${Date.now().toString().slice(-6)}`

  // 1. Insert product
  const [createdProduct] = await db
    .insert(products)
    .values({
      ownerId: user.id,
      categoryId: categoryId || null,
      name: String(name).trim(),
      slug: String(slug).trim().toLowerCase(),
      sku: String(generatedSku).trim().toUpperCase(),
      shortDescription: shortDescription ? String(shortDescription).trim() : null,
      description: description ? String(description).trim() : null,
      price: Number(price), // in paise
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      costPrice: Number(costPrice), // in paise
      colors: colors || null,
      sizes: sizes || null,
      details: details || null,
      status: status,
      isFeatured: Boolean(isFeatured),
    })
    .returning()

  // 2. Insert product images (supports multi-image array with fallback to single imageUrl)
  const imagesList: Array<{
    url: string
    publicId?: string | null
    alt?: string | null
    sortOrder?: number
    isPrimary?: boolean
  }> = Array.isArray(body.images) && body.images.length > 0
    ? body.images
    : (imageUrl ? [{ url: imageUrl, publicId: body.publicId, alt: createdProduct.name, sortOrder: 0, isPrimary: true }] : [])

  if (imagesList.length > 0) {
    const hasPrimary = imagesList.some((img) => img.isPrimary)
    const imageInserts = imagesList.map((img, index) => ({
      productId: createdProduct.id,
      url: String(img.url).trim(),
      publicId: img.publicId ? String(img.publicId).trim() : null,
      alt: img.alt ? String(img.alt).trim() : createdProduct.name,
      sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : index,
      isPrimary: hasPrimary ? Boolean(img.isPrimary) : index === 0,
    }))

    await db.insert(productImages).values(imageInserts)
  }

  // 3. Insert inventory
  await db.insert(inventory).values({
    productId: createdProduct.id,
    quantity: Number(stock) || 0,
    reservedQuantity: 0,
  })

  // 4. Asynchronous Notifications and Email
  // Personal notification for the owner
  createNotification({
    userId: user.id,
    type: 'PRODUCT_CREATED',
    title: 'Product Published',
    message: `"${createdProduct.name}" is now live in your studio inventory.`,
    link: '/owner/products',
  }).catch((err) => console.error('[Product Owner Notification Error]:', err))

  // Role notification for Admins
  createNotification({
    role: 'ADMIN',
    type: 'PRODUCT_CREATED',
    title: 'New Product Listed',
    message: `${user.name} added "${createdProduct.name}" to the marketplace catalog.`,
    link: '/admin/products',
  }).catch((err) => console.error('[Product Admin Notification Error]:', err))

  // General notification for all Buyers on the platform
  createNotification({
    type: 'PRODUCT_CREATED',
    title: 'New Handcrafted Piece',
    message: `"${createdProduct.name}" from ${user.name} was just added to the collection.`,
    link: `/product/${createdProduct.slug}`,
  }).catch((err) => console.error('[Product Buyer Broadcast Notification Error]:', err))

  sendProductPublishedEmail(user.email, user.name, createdProduct.name, 'Shopizz Studio').catch((err) =>
    console.error('[Product Published Email Error]:', err)
  )

  return {
    success: true,
    product: createdProduct,
  }
})

