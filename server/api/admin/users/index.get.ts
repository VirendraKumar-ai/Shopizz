import { desc, eq, sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { users, orders, products } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const roleFilter = query.role ? String(query.role) : undefined
  const statusFilter = query.status ? String(query.status) : undefined
  const search = query.search ? String(query.search).trim() : ''

  // 1. Fetch all users
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))

  // 2. Fetch buyer order stats (orders count, total spent in paise)
  const buyerOrders = await db
    .select({
      buyerId: orders.buyerId,
      orderCount: sql<number>`count(${orders.id})`,
      totalSpent: sql<number>`sum(${orders.totalAmount})`,
    })
    .from(orders)
    .groupBy(orders.buyerId)

  const buyerOrderMap = new Map<string, { count: number; spent: number }>()
  for (const bo of buyerOrders) {
    if (bo.buyerId) {
      buyerOrderMap.set(bo.buyerId, {
        count: Number(bo.orderCount || 0),
        spent: Number(bo.totalSpent || 0),
      })
    }
  }

  // 3. Fetch owner product counts
  const ownerProducts = await db
    .select({
      ownerId: products.ownerId,
      productCount: sql<number>`count(${products.id})`,
    })
    .from(products)
    .groupBy(products.ownerId)

  const ownerProductMap = new Map<string, number>()
  for (const op of ownerProducts) {
    if (op.ownerId) {
      ownerProductMap.set(op.ownerId, Number(op.productCount || 0))
    }
  }

  // Enhance users with lifetime stats
  const enhancedUsers = allUsers.map((u) => {
    const orderInfo = buyerOrderMap.get(u.id) || { count: 0, spent: 0 }
    const productCount = ownerProductMap.get(u.id) || 0

    return {
      ...u,
      orderCount: orderInfo.count,
      totalSpentPaise: orderInfo.spent,
      productCount,
    }
  })

  // Filtering
  let filtered = enhancedUsers

  if (roleFilter && roleFilter !== 'ALL') {
    filtered = filtered.filter((u) => u.role === roleFilter)
  }

  if (statusFilter && statusFilter !== 'ALL') {
    const isActive = statusFilter === 'ACTIVE'
    filtered = filtered.filter((u) => u.isActive === isActive)
  }

  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s)
    )
  }

  // Metrics
  const metrics = {
    total: enhancedUsers.length,
    buyers: enhancedUsers.filter((u) => u.role === 'BUYER').length,
    owners: enhancedUsers.filter((u) => u.role === 'OWNER').length,
    admins: enhancedUsers.filter((u) => u.role === 'ADMIN').length,
    active: enhancedUsers.filter((u) => u.isActive).length,
    suspended: enhancedUsers.filter((u) => !u.isActive).length,
  }

  return {
    success: true,
    users: filtered,
    metrics,
  }
})
