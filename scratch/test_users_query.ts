import 'dotenv/config'
import { db } from '../server/utils/db'
import { users, orders, products } from '../db/schema'
import { desc, sql } from 'drizzle-orm'

async function testUsersApiQuery() {
  console.log('Testing users query logic...')

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

  const buyerOrders = await db
    .select({
      buyerId: orders.buyerId,
      orderCount: sql<number>`count(${orders.id})`,
      totalSpent: sql<number>`sum(${orders.totalAmount})`,
    })
    .from(orders)
    .groupBy(orders.buyerId)

  const ownerProducts = await db
    .select({
      ownerId: products.ownerId,
      productCount: sql<number>`count(${products.id})`,
    })
    .from(products)
    .groupBy(products.ownerId)

  console.log('✓ Successfully retrieved', allUsers.length, 'users.')
  console.log('✓ Buyer orders aggregation:', buyerOrders)
  console.log('✓ Owner products aggregation:', ownerProducts)
}

testUsersApiQuery().then(() => process.exit(0)).catch(e => { console.error('Query failed:', e); process.exit(1) })
