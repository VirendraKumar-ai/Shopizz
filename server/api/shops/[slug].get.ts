import { desc, eq, and } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  users,
  products,
  productImages,
  categories,
  reviews,
  ownerApplications,
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Shop handle or slug is required',
    })
  }

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

  // Find owner by shopSlug, shopName or name slug
  const allOwners = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      shopName: ownerApplications.shopName,
      shopDescription: ownerApplications.description,
      imageUrl: ownerApplications.imageUrl,
      logoUrl: ownerApplications.logoUrl,
    })
    .from(users)
    .leftJoin(ownerApplications, eq(users.id, ownerApplications.userId))
    .where(eq(users.role, 'OWNER'))

  // Match by slugified shopName, slugified userName, or user id
  const targetOwner = allOwners.find((o) => {
    const shopSlug = o.shopName ? slugify(o.shopName) : ''
    const userSlug = slugify(o.name)
    const normalizedTarget = slug.toLowerCase().trim()

    return (
      shopSlug === normalizedTarget ||
      userSlug === normalizedTarget ||
      o.id === normalizedTarget ||
      (o.shopName && o.shopName.toLowerCase().trim() === normalizedTarget)
    )
  }) || allOwners[0]

  if (!targetOwner) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Shop not found',
    })
  }

  // Fetch shop products
  const productRows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      isFeatured: products.isFeatured,
      createdAt: products.createdAt,
      categoryName: categories.name,
      imageUrl: productImages.url,
    })
    .from(products)
    .leftJoin(productImages, eq(products.id, productImages.productId))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.ownerId, targetOwner.id))
    .orderBy(desc(products.createdAt))

  const productMap = new Map<string, any>()
  for (const p of productRows) {
    if (!productMap.has(p.id)) {
      productMap.set(p.id, {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        isFeatured: p.isFeatured,
        categoryName: p.categoryName || 'Lifestyle',
        imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80',
        createdAt: p.createdAt,
      })
    }
  }

  const shopProducts = Array.from(productMap.values())

  // Calculate shop review stats
  const shopReviews = await db
    .select({
      rating: reviews.rating,
    })
    .from(reviews)
    .innerJoin(products, eq(reviews.productId, products.id))
    .where(eq(products.ownerId, targetOwner.id))

  const avgRating = shopReviews.length > 0
    ? (shopReviews.reduce((sum, r) => sum + r.rating, 0) / shopReviews.length).toFixed(1)
    : '5.0'

  return {
    success: true,
    shop: {
      id: targetOwner.id,
      name: targetOwner.shopName || targetOwner.name || 'Artisan Studio',
      slug: slug,
      location: 'Jaipur, Rajasthan',
      bio: targetOwner.shopDescription || 'Creating thoughtful, slow-made pieces using sustainable materials and time-honored artisanal crafts.',
      memberSince: new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(targetOwner.createdAt)),
      avatarUrl: targetOwner.logoUrl || null,
      bannerUrl: targetOwner.imageUrl || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=1600&q=80',
      totalProducts: shopProducts.length,
      averageRating: avgRating,
      totalReviews: shopReviews.length,
      products: shopProducts,
    },
  }
})
