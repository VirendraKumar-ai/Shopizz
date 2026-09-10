import { and, desc, eq, ne } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  products,
  categories,
  productImages,
  inventory,
  users,
  ownerApplications,
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product slug is required',
    })
  }

  // 1. Fetch main product details
  const rows = await db
    .select({
      id: products.id,
      ownerId: products.ownerId,
      categoryId: products.categoryId,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
      shortDescription: products.shortDescription,
      description: products.description,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      colors: products.colors,
      sizes: products.sizes,
      details: products.details,
      rating: products.rating,
      reviewCount: products.reviewCount,
      soldCount: products.soldCount,
      status: products.status,
      isFeatured: products.isFeatured,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,

      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
      },

      image: {
        id: productImages.id,
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

      shopApplication: {
        shopName: ownerApplications.shopName,
        description: ownerApplications.description,
        address: ownerApplications.address,
        logoUrl: ownerApplications.logoUrl,
        status: ownerApplications.status,
      },
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(productImages, eq(products.id, productImages.productId))
    .leftJoin(inventory, eq(products.id, inventory.productId))
    .innerJoin(users, eq(products.ownerId, users.id))
    .leftJoin(ownerApplications, eq(products.ownerId, ownerApplications.userId))
    .where(eq(products.slug, slug))

  const first = rows[0]

  if (!first || first.status !== 'ACTIVE') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found',
    })
  }

  // Map & deduplicate gallery images
  const imagesMap = new Map<string, any>()
  rows.forEach((r) => {
    if (r.image?.url && !imagesMap.has(r.image.url)) {
      imagesMap.set(r.image.url, {
        id: r.image.id,
        url: r.image.url,
        alt: r.image.alt || first.name,
        isPrimary: Boolean(r.image.isPrimary),
        sortOrder: r.image.sortOrder ?? 0,
      })
    }
  })

  const images = Array.from(imagesMap.values()).sort(
    (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  )

  // Default color variants if none stored
  const defaultColors = [
    { name: 'Oat', hex: '#D6C7B2', inStock: true },
    { name: 'Olive', hex: '#4B5320', inStock: true },
    { name: 'Charcoal', hex: '#2A2B2A', inStock: true },
    { name: 'Rust', hex: '#A34F38', inStock: true },
  ]

  const defaultSizes = ['XS', 'S', 'M', 'L', 'XL']

  const defaultDetails = {
    materials: '100% Organic European Flax Linen (185 GSM)',
    care: 'Machine wash cold on gentle cycle with mild detergent. Line dry in shade.',
    fit: 'Relaxed, airy silhouette designed for effortless everyday layering.',
    ethics: [
      'Sustainable Materials',
      'Ethically Made',
      'Small Batch Production',
      'Supports Local Artisans',
    ],
  }

  const shopInfo = {
    name: first.shopApplication?.shopName || 'The Loom Studio',
    location: first.shopApplication?.address || 'Jaipur, Rajasthan',
    description:
      first.shopApplication?.description ||
      'Thoughtful clothing for everyday living. Rooted in craft, made for modern life.',
    logoUrl: first.shopApplication?.logoUrl || null,
    isVerified: true,
  }

  // 2. Fetch Related / Recommended products ("You may also like")
  const relatedRows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      rating: products.rating,
      reviewCount: products.reviewCount,
      imageUrl: productImages.url,
      ownerName: users.name,
      shopName: ownerApplications.shopName,
    })
    .from(products)
    .leftJoin(productImages, and(eq(products.id, productImages.productId), eq(productImages.isPrimary, true)))
    .leftJoin(users, eq(products.ownerId, users.id))
    .leftJoin(ownerApplications, eq(products.ownerId, ownerApplications.userId))
    .where(and(eq(products.status, 'ACTIVE'), ne(products.id, first.id)))
    .limit(6)

  const relatedProducts = relatedRows.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    price: item.price,
    compareAtPrice: item.compareAtPrice,
    rating: item.rating || 4.7,
    imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80',
    shopName: item.shopName || item.ownerName || 'The Loom Studio',
  }))

  return {
    success: true,
    product: {
      id: first.id,
      name: first.name,
      slug: first.slug,
      sku: first.sku,
      shortDescription: first.shortDescription,
      description: first.description,
      price: first.price,
      compareAtPrice: first.compareAtPrice,
      status: first.status,
      isFeatured: first.isFeatured,
      category: first.category,
      stock: first.stock ?? 0,
      owner: first.owner,
      shop: shopInfo,
      images,
      colors: (first.colors as any) || defaultColors,
      sizes: (first.sizes as any) || defaultSizes,
      details: (first.details as any) || defaultDetails,
      rating: first.rating || 4.8,
      reviewCount: first.reviewCount || 120,
      soldCount: first.soldCount || 326,
    },
    relatedProducts,
  }
})
