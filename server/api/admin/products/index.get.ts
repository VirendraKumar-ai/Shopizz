import { desc, eq, sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import {
  products,
  users,
  categories,
  productImages,
  inventory,
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const statusFilter = query.status ? String(query.status) : undefined
  const categoryFilter = query.category ? String(query.category) : undefined
  const search = query.search ? String(query.search).trim() : ''
  const featuredOnly = query.featured === 'true'

  // Fetch all products with joins
  const allProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      costPrice: products.costPrice,
      status: products.status,
      isFeatured: products.isFeatured,
      rating: products.rating,
      reviewCount: products.reviewCount,
      soldCount: products.soldCount,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      owner: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      },
      stock: inventory.quantity,
      reservedStock: inventory.reservedQuantity,
    })
    .from(products)
    .innerJoin(users, eq(products.ownerId, users.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(inventory, eq(products.id, inventory.productId))
    .orderBy(desc(products.createdAt))

  // Fetch primary or first images for all products
  const images = await db
    .select({
      productId: productImages.productId,
      url: productImages.url,
      isPrimary: productImages.isPrimary,
    })
    .from(productImages)

  const imageMap = new Map<string, string>()
  for (const img of images) {
    if (!imageMap.has(img.productId) || img.isPrimary) {
      imageMap.set(img.productId, img.url)
    }
  }

  const enhancedProducts = allProducts.map((p) => ({
    ...p,
    primaryImage: imageMap.get(p.id) || null,
    stock: p.stock ?? 0,
    reservedStock: p.reservedStock ?? 0,
  }))

  // Filtering
  let filtered = enhancedProducts

  if (statusFilter && statusFilter !== 'ALL') {
    filtered = filtered.filter((p) => p.status === statusFilter)
  }

  if (categoryFilter && categoryFilter !== 'ALL') {
    filtered = filtered.filter((p) => p.category?.id === categoryFilter || p.category?.slug === categoryFilter)
  }

  if (featuredOnly) {
    filtered = filtered.filter((p) => p.isFeatured)
  }

  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        p.owner.name.toLowerCase().includes(s) ||
        p.owner.email.toLowerCase().includes(s) ||
        (p.category?.name && p.category.name.toLowerCase().includes(s))
    )
  }

  // Calculate summary counts
  const counts = {
    total: enhancedProducts.length,
    active: enhancedProducts.filter((p) => p.status === 'ACTIVE').length,
    draft: enhancedProducts.filter((p) => p.status === 'DRAFT').length,
    archived: enhancedProducts.filter((p) => p.status === 'ARCHIVED').length,
    featured: enhancedProducts.filter((p) => p.isFeatured).length,
  }

  return {
    success: true,
    products: filtered,
    counts,
  }
})
