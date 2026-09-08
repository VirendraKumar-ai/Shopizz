import { count, desc, eq, sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import {
  ownerApplications,
  users,
  products,
  categories,
  orders,
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  // 1. Pending owner applications count
  const [pendingAppsRow] = await db
    .select({ count: count(ownerApplications.id) })
    .from(ownerApplications)
    .where(eq(ownerApplications.status, 'PENDING'))

  // 2. Active shop owners count
  const [activeOwnersRow] = await db
    .select({ count: count(users.id) })
    .from(users)
    .where(sql`${users.role} = 'OWNER' and ${users.isActive} = true`)

  // 3. Total active products count
  const [totalProductsRow] = await db
    .select({ count: count(products.id) })
    .from(products)
    .where(eq(products.status, 'ACTIVE'))

  // 4. Total active categories count
  const [totalCategoriesRow] = await db
    .select({ count: count(categories.id) })
    .from(categories)
    .where(eq(categories.status, 'ACTIVE'))

  // 5. Recent pending applications
  const recentRequests = await db
    .select({
      id: ownerApplications.id,
      shopName: ownerApplications.shopName,
      description: ownerApplications.description,
      phone: ownerApplications.phone,
      address: ownerApplications.address,
      reason: ownerApplications.reason,
      status: ownerApplications.status,
      createdAt: ownerApplications.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(ownerApplications)
    .innerJoin(users, eq(ownerApplications.userId, users.id))
    .where(eq(ownerApplications.status, 'PENDING'))
    .orderBy(desc(ownerApplications.createdAt))
    .limit(4)

  // 6. Recent orders for activity feed
  const recentOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      totalAmount: orders.totalAmount,
      shippingName: orders.shippingName,
      shippingCity: orders.shippingCity,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(4)

  return {
    success: true,
    stats: {
      pendingRequests: pendingAppsRow?.count ?? 0,
      activeOwners: activeOwnersRow?.count ?? 0,
      totalProducts: totalProductsRow?.count ?? 0,
      totalCategories: totalCategoriesRow?.count ?? 0,
    },
    recentRequests,
    recentOrders,
  }
})
