import { and, desc, eq, ilike, or } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import {
  products,
  categories,
  productImages,
  ownerApplications,
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = query.q ? String(query.q).trim() : ''

  if (!q) {
    return {
      success: true,
      products: [],
      categories: [],
      shops: [],
    }
  }

  const searchPattern = `%${q}%`

  // 1. Search Products
  const matchingProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      status: products.status,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.status, 'ACTIVE'),
        or(
          ilike(products.name, searchPattern),
          ilike(products.description, searchPattern),
          ilike(products.shortDescription, searchPattern),
          ilike(products.sku, searchPattern),
          ilike(categories.name, searchPattern)
        )
      )
    )
    .limit(8)

  // Fetch primary images for matched products
  const productsWithImages = await Promise.all(
    matchingProducts.map(async (prod) => {
      const [img] = await db
        .select({ url: productImages.url })
        .from(productImages)
        .where(eq(productImages.productId, prod.id))
        .orderBy(desc(productImages.isPrimary), productImages.sortOrder)
        .limit(1)

      return {
        ...prod,
        imageUrl: img?.url || null,
      }
    })
  )

  // 2. Search Categories
  const matchingCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      imageUrl: categories.imageUrl,
    })
    .from(categories)
    .where(
      and(
        eq(categories.status, 'ACTIVE'),
        or(
          ilike(categories.name, searchPattern),
          ilike(categories.description, searchPattern),
          ilike(categories.slug, searchPattern)
        )
      )
    )
    .limit(6)

  // 3. Search Approved Shops / Makers
  const matchingShops = await db
    .select({
      id: ownerApplications.id,
      shopName: ownerApplications.shopName,
      description: ownerApplications.description,
      address: ownerApplications.address,
      imageUrl: ownerApplications.imageUrl,
      logoUrl: ownerApplications.logoUrl,
    })
    .from(ownerApplications)
    .where(
      and(
        eq(ownerApplications.status, 'APPROVED'),
        or(
          ilike(ownerApplications.shopName, searchPattern),
          ilike(ownerApplications.description, searchPattern),
          ilike(ownerApplications.address, searchPattern)
        )
      )
    )
    .limit(4)

  return {
    success: true,
    query: q,
    products: productsWithImages,
    categories: matchingCategories,
    shops: matchingShops,
  }
})
